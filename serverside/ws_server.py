import asyncio
import websockets
import openai
import json
import traceback

# ← Enter your key here:
openai.api_key = ""

async def handler(ws, path):
    if path != "/ws":
        await ws.close(1008, "Invalid path")
        return
    
    print(f"Client connected from {ws.remote_address}")
    
    try:
        async for msg in ws:
            # Print raw report
            print("=== Raw Report ===")
            print(msg, "\n")
            
            # Ask GPT for a single-sentence description
            try:
                ai_resp = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a mapping assistant. "
                                "Given raw OpenStreetMap information properties, and you are an avatar that you want to explain it to a user. "
                                "return two, very brief sentences describing the place he clicked on and explain about it briefly"
                            )
                        },
                        {"role": "user", "content": msg}
                    ],
                    max_tokens=30,
                    temperature=0.5
                )
                description = ai_resp.choices[0].message.content.strip()
            except Exception as e:
                print(f"OpenAI API error: {str(e)}")
                traceback.print_exc()
                description = f"Error processing your request. Please try again."
            
            print("=== Brief Description ===")
            print(description)
            print("\n" + "-"*40 + "\n")
            
            # Send the description back to the client
            try:
                await ws.send(description)
                print(f"Response sent to client: {description}")
            except Exception as e:
                print(f"Error sending response to client: {str(e)}")
                traceback.print_exc()
                
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed: {e.code} - {e.reason}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        traceback.print_exc()

async def main():
    # Start WebSocket server with proper CORS handling
    async with websockets.serve(
        handler, 
        "localhost", 
        8000, 
        ping_interval=30,  # Send ping frames every 30 seconds
        ping_timeout=10    # Wait 10 seconds for pong response
    ) as server:
        print("WebSocket server started on ws://localhost:8000/ws")
        # Keep the server running indefinitely
        await asyncio.Future()  # This will run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Server stopped by user")
    except Exception as e:
        print(f"Server error: {str(e)}")
        traceback.print_exc()