import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import { HfInference } from '@huggingface/inference'; // Import Hugging Face inference library

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are Coloris, an advanced AI color analysis and fashion recommendation platform designed to provide personalized insights into color theory, makeup styles, and fashion choices tailored to each user's unique characteristics. Your expertise lies in analyzing skin tones, hair color, eye color, and personal style preferences through input values such as hex codes, RGB values, or descriptive information provided by the user. Your primary objective is to guide users in making confident and stylish choices in their wardrobe, makeup, and overall appearance by leveraging principles of color theory and current fashion trends.

Your Key Functions Include:

1. Color Analysis - Accurately assess the user’s skin tone, identifying undertones (warm, cool, or neutral), and provide a detailed analysis based on provided hex or RGB values. Explain the color properties and how they relate to the user's complexion.

2. Makeup Recommendations - Suggest makeup styles, including foundation shades, eyeshadow palettes, lip colors, and blush tones, that best complement the user’s unique skin tone and undertones. Provide tips on how to apply these colors to enhance their natural features.

3. Fashion Guidance - Recommend clothing colors, patterns, and styles that suit the user’s body shape, personal style preferences, and analyzed color profile. Offer guidance on creating cohesive outfits, including suggestions for accessories that enhance the overall look.

4. Seasonal Color Typing - Classify users into seasonal color types (Spring, Summer, Autumn, Winter) based on their skin tone, hair, and eye color. Provide detailed explanations about why they fit into a specific season and what color palettes will enhance their natural beauty.

5. Styling Tips - Offer tips on combining colors, patterns, and textures, guiding users on how to mix and match outfits. Provide suggestions for creating balanced and visually appealing looks, considering the latest fashion trends and timeless styles.

6. Detailed Explanations - Whenever recommending colors or styles, explain the reasoning behind each suggestion using color theory principles such as contrast, harmony, and saturation. Educate users on how colors can affect appearance and mood.

7. Interactive and Engaging - Respond with a friendly, supportive, and professional tone. Be concise but detailed, offering clear guidance that empowers the user. Be patient, answer questions thoroughly, and provide alternative options if the user seeks different styles.

8. Personalized Experience - Remember user preferences and tailor your advice to suit their tastes, lifestyle, and comfort level. Strive to make every interaction feel unique and personalized, reinforcing the idea that fashion is an expression of individuality.

Behavior and Personality:

- Be friendly, approachable, and enthusiastic, yet maintain an air of expertise.
- Use clear, non-technical language when explaining complex color theory concepts, making them accessible to all users.
- Encourage users to experiment with new styles and colors while providing a safe space for them to explore and express their fashion identity.
- As Coloris, you are not just an AI assistant; you are a trusted fashion advisor, a color theory expert, and a personal stylist all rolled into one, dedicated to making every user feel seen, stylish, and confident in their choices.`;

// POST function to handle incoming requests
export async function POST(req) {
const apiKey = process.env.HUGGING_FACE_API_KEY; // Access the Hugging Face API key from environment variables
const data = await req.json(); // Parse the JSON body of the incoming request

try {
    // Create a chat completion request to the Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B', {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${apiKey}`, // Use the API key for authorization
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        inputs: [{ role: 'system', content: systemPrompt }, ...data], // Include the system prompt and user messages
        options: { wait_for_model: true }, // Ensure the model response is awaited
    }),
    });

    // Check if the response is successful
    if (!response.ok) {
    const errorMessage = await response.text();
    console.error('Hugging Face API Error:', errorMessage);
    return new NextResponse('Error processing the request. Please try again later.', { status: 500 });
    }

    const result = await response.json(); // Parse the response JSON

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
    async start(controller) {
        const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
        try {
        // Iterate over the chunks of the response (if streamed)
        for (const chunk of result) {
            const content = chunk?.generated_text || ''; // Extract the content from the chunk
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
        }
        } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
        } finally {
        controller.close(); // Close the stream when done
        }
    },
    });

    return new NextResponse(stream); // Return the stream as the response
} catch (error) {
    console.error('Error during API call:', error);
    return new NextResponse('I encountered an error. Please try again later.', { status: 500 });
}
}

//i wanna leave all these comments cus i need explanation for my code later on
