import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import request from 'request' // Import the 'request' module

// Define your Spotify API credentials
const client_id = 'fba4995261234e5d81ddceeafc24dd01'
const client_secret = 'afeb43d09d434370b731d1e257cf1e50'
let spotifyAccessToken = ''
let tokentype = ''
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
// Define a type for the email data
interface EmailData {
  to: string
  subject: string
  text: string
}

// Function to fetch weather information from your weather API
async function getWeather(location?: string): Promise<string> {
  try {
    let weatherURL = 'https://weathergpt.vercel.app/'
    if (location) {
      weatherURL += encodeURIComponent(location)
    }

    const response = await fetch(weatherURL)

    const data = await response.json()
    console.log(data)
    // Construct weather information string
    let weatherInfo = ''
    if (location) {
      weatherInfo = `Weather in ${location}: ${data.weather}, Temperature: ${data.temperature}°C`
    } else {
      weatherInfo = `Weather in your current location: ${data.weather}, Temperature: ${data.temperature}°C`
    }

    return weatherInfo
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return 'Sorry, unable to fetch weather information at the moment.'
  }
}
async function sendEmail(emailData: EmailData) {
  try {
    const response = await fetch(
      'https://500825de-5012-4600-be86-c09cde2c30b6-00-cm5qqji7ptvv.pike.replit.dev/send-email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to send email. Status: ${response.status}`)
    }

    // Check content type
    const contentType = response.headers.get('Content-Type')
    if (contentType && contentType.includes('application/json')) {
      // Parse JSON response
      return response.json()
    } else {
      // Return response text
      return response.text()
    }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Function to obtain an access token from the Spotify API
async function getSpotifyAccessToken() {
  return new Promise((resolve, reject) => {
    // Set up the authentication options
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(client_id + ':' + client_secret).toString('base64')
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true
    }

    // Send a POST request to obtain the access token
    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const token = body.access_token
        spotifyAccessToken = token
        tokentype = body.token_type
        console.log('Spotify access token:', token)
        console.log('Spotify body :', body)
        resolve(token) // Resolve with the access token
      } else {
        reject(error || 'Failed to obtain access token')
      }
    })
  })
}

async function searchSpotifyAlbums(
  query: string,
  accessToken: string,
  token_type: string
) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album`,
      {
        method: 'GET',
        headers: {
          Authorization: `${token_type} ${accessToken}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch albums from Spotify')
    }

    return response.json()
  } catch (error) {
    console.error('Error searching for albums on Spotify:', error)
    throw error
  }
}
export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  // Check if the latest message contains the phrase related to providing email and password
  const latestMessage = messages[messages.length - 1].content.toLowerCase()

  if (latestMessage.includes('login') && latestMessage.includes('spotify')) {
    // Obtain Spotify access token

    try {
      await getSpotifyAccessToken()

      return new Response(
        '(DEVELOPMENT MODE)  Spotify access obtained,Here is your token:' +
          spotifyAccessToken
      )
    } catch (error) {
      console.error('Error obtaining Spotify access token:', error)
      return new Response('Failed to obtain Spotify access token', {
        status: 500
      })
    }
  } else if (
    latestMessage.includes('spotify') &&
    latestMessage.includes('search')
  ) {
    // Extract the query from the message
    const match = latestMessage.match(/spotify\s+search\s+(.+)/i)
    if (match && match.length === 2) {
      const query = match[1].trim()

      // Search for albums on Spotify
      try {
        const searchResults = await searchSpotifyAlbums(
          query,
          spotifyAccessToken,
          tokentype
        )
        console.log('Spotify search results:', searchResults)

        // Respond to the user with the search results (you can customize this part)
        // For example, you can send a response back to the client application
        // or you can integrate this with your chat interface

        // Returning a simple response for demonstration
        return new Response(JSON.stringify(searchResults), { status: 200 })
      } catch (error) {
        console.error('Error searching for albums on Spotify:', error)
        return new Response('Failed to search for albums on Spotify', {
          status: 500
        })
      }
    }
  }
  if (
    latestMessage.includes('send email') ||
    latestMessage.includes('send mail') ||
    latestMessage.includes('mail to')
  ) {
    // Extract recipient email and email body from the user's message
    const match = messages[messages.length - 1].content.match(
      /send mail to (.+?) with the body (.+)/i
    )
    if (match && match.length === 3) {
      const recipientEmail = match[1].trim()
      const emailBody = match[2].trim()

      // Prepare email data
      const emailData = {
        to: recipientEmail,
        subject: 'Test Email',
        text: emailBody
      }

      // Call sendEmail function
      try {
        await sendEmail(emailData)
        // Respond to the user indicating that the email has been sent
        return new Response(
          `Email sent to ${recipientEmail} with the specified body.`
        )
      } catch (error) {
        console.error('Error sending email:', error)
        // Respond to the user indicating that there was an error sending the email
        return new Response('Failed to send email. Please try again later.')
      }
    } else {
      // Respond to the user indicating that the message format is invalid
      return new Response(
        'Invalid email format. Please use the format: "send mail to [recipient email] with the body [email body]"'
      )
    }
  } else if (
    latestMessage.includes('login') &&
    latestMessage.includes('mail') &&
    latestMessage.includes('password')
  ) {
    // Extract email ID and password from the message
    const match = latestMessage.match(
      /login\s+to\s+my\s+email\s+id\s+(\S+@\S+)\s+password\s+is\s+(\S+)/i
    )
    if (match && match.length === 3) {
      const email = match[1]
      const password = match[2]

      // Prepare data to send to the API
      const requestData = {
        email,
        password
      }

      // Send POST request to the API
      try {
        const response = await fetch(
          'https://500825de-5012-4600-be86-c09cde2c30b6-00-cm5qqji7ptvv.pike.replit.dev/set-email-password',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
          }
        )

        if (!response.ok) {
          throw new Error('Failed to send data to the API')
        }
        if (response.ok) {
          return new Response('Successfully logged in to email id ' + email, {
            status: 200
          })
        }
        // Handle API response if needed
        const responseDataText = await response.text()
        console.log('API response:', responseDataText)
      } catch (error) {
        console.error('Error sending data to the API:', error)
        // Handle error response if needed
        return new Response('Failed to send data to the API', { status: 500 })
      }
    }
  } else if (
    latestMessage.includes('look') &&
    latestMessage.includes('product')
  ) {
    const match = latestMessage.match(/product online (.+)/)
    if (match) {
      const productName = match[1]
      console.log('Product Name:', productName)
      const requestData = {
        keyword: productName,
        domainCode: 'com',
        sortBy: 'relevanceblender',
        page: 1
      }
      console.log('Product Name:', productName)
      // Send POST request to the API
      try {
        const response = await fetch(
          'https://500825de-5012-4600-be86-c09cde2c30b6-00-cm5qqji7ptvv.pike.replit.dev/ecommerce-add',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
          }
        )
        // Handle API response if needed
        const responseDataText = await response.text()
        if (!response.ok) {
          throw new Error('Failed to send data to the API')
        }
        if (response.ok) {
          return new Response('Successfully  fetched ' + responseDataText, {
            status: 200
          })
        }

        console.log('API response:', responseDataText)
      } catch (error) {
        console.error('Error sending data to the API:', error)
        // Handle error response if needed
        return new Response('Failed to send data to the API', { status: 500 })
      }
    } else {
      console.log('Product name not found in the message.')
    }
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      try {
        // Detect weather queries
        if (completion.toLowerCase().includes('weather')) {
          const locationMatch = completion.match(/weather of(.+)/i)
          if (locationMatch && locationMatch[1]) {
            const location = locationMatch[1].trim()
            const weatherInfo = await getWeather(location)
            if (weatherInfo) {
              // Prepend weather information to the completion
              completion = `Here is the current weather info for ${location}${weatherInfo}\n\n${completion}`
            } else {
              // Weather information not available
              completion = `Sorry, I couldn't retrieve weather information for ${location} at the moment.\n\n${completion}`
            }
          }
        }

        const title = json.messages[0].content.substring(0, 100)
        const id = json.id ?? nanoid()
        const createdAt = Date.now()
        const path = `/chat/${id}`
        const payload = {
          id,
          title,
          userId,
          createdAt,
          path,
          messages: [
            ...messages,
            {
              content: completion,
              role: 'assistant'
            }
          ]
        }
        await kv.hmset(`chat:${id}`, payload)
        await kv.zadd(`user:chat:${userId}`, {
          score: createdAt,
          member: `chat:${id}`
        })
      } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error processing completion:', error)
      }
    }
  })

  return new StreamingTextResponse(stream)
}
