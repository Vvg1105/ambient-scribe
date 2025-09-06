#!/usr/bin/env python3
"""
Simple test to verify OpenAI API connection
"""
import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

def test_openai_connection():
    """Test basic OpenAI API connection"""
    print("🔍 Testing OpenAI API connection...")
    
    # Check if API key is loaded
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ No OPENAI_API_KEY found in environment")
        return False
    
    print(f"✅ API key found (length: {len(api_key)} characters)")
    print(f"   Key starts with: {api_key[:10]}...")
    
    # Check if key looks valid
    if not api_key.startswith("sk-"):
        print("❌ API key doesn't start with 'sk-' - may be invalid")
        return False
    
    try:
        # Initialize client
        client = OpenAI(api_key=api_key)
        
        # Make a simple test request
        print("🧪 Making test API call...")
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "user", "content": "Say 'Hello, API test successful!' and nothing else."}
            ],
            max_tokens=20,
            temperature=0.0,
            timeout=10
        )
        
        result = response.choices[0].message.content
        print(f"✅ API call successful!")
        print(f"   Response: {result}")
        return True
        
    except Exception as e:
        print(f"❌ API call failed: {e}")
        return False

if __name__ == "__main__":
    success = test_openai_connection()
    if success:
        print("\n🎉 OpenAI API is working correctly!")
    else:
        print("\n💥 OpenAI API connection failed!")
        print("\nTroubleshooting tips:")
        print("1. Check if your API key is valid and complete")
        print("2. Verify you have credits/billing set up in your OpenAI account")
        print("3. Make sure the .env file is in the correct location")
        print("4. Check if there are any network/firewall issues")
    
    sys.exit(0 if success else 1)
