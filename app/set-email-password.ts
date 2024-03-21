import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { email, password } = req.body

    // Perform validation on email and password if needed

    // Update email and password in a global context (for example, using a database or a global variable)

    // Example: Update email and password in a global variable
    ;(global as any).email = email
    ;(global as any).password = password

    return res
      .status(200)
      .json({ message: 'Email and password updated successfully' })
  } catch (error) {
    console.error('Error updating email and password:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
