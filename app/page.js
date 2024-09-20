'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm ColorisAI, Your Personal Colour Analysis Assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;  // Don't send empty messages
    setIsLoading(true)

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ 
        backgroundImage: 'url(/27.png)', // Replace with your image path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        p: 2,
      }}
    >
      <Box
        width="100%"
        p={4}
        sx={{
          background: 'rgba(255, 255, 255, 0.5)', // Semi-transparent background for the header
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '0 0 16px 16px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <img src="/colorislogo.png" alt="ColorisAI Logo" style={{ height: '30px' }} /> 
        <Typography variant="subtitle1">Personal Colour Analysis Bot</Typography>
      </Box>
      <Stack
        direction={'column'}
        width="600px" 
        height="700px"
        borderRadius={16}
        border="1px solid rgba(255, 255, 255, 0.3)" 
        boxShadow="0px 4px 12px rgba(0, 0, 0, 0.2)"
        bgcolor="rgba(255, 255, 255, 0.2)"
        p={2}
        spacing={3}
        sx={{
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginTop: '60px', 
        }}
      >
        <Typography variant="h6" component="div" fontWeight="bold" textAlign="center" color="white">
          Chat with ColorisAI
        </Typography>
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'white'
                    : 'black'
                }
                color={
                  message.role === 'assistant'
                    ? 'black'
                    : 'white'
                }
                borderRadius={16}
                p={2}
                sx={{ maxWidth: '75%', wordWrap: 'break-word' }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems="center">
          <TextField
            label="Type your message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            size="small"
            InputLabelProps={{ style: { color: 'white' } }}
            InputProps={{ style: { color: 'white' } }}
          />
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={sendMessage} 
            disabled={isLoading}
            sx={{ height: '100%' }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
