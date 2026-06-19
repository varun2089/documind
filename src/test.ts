import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
            { role: 'user', content: 'Tell me one fun fact about document intelligence systems.' }
        ],
    });

    const block = response.content[0];
    if (block.type === 'text') {
        console.log(block.text);
    }
}

main().catch(err => console.error('Error:', err));