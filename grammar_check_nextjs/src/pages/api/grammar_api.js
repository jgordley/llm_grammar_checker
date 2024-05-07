import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { text, provider, model, key, suggestionType } = req.body;

        try {
            const apiUrl = process.env.FASTAPI_SERVER_URL + '/check_grammar';
            const response = await axios.post(apiUrl, { text, provider, model, key, suggestionType });

            // Return the data from FastAPI to the client
            console.log('response', response);
            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error calling FastAPI server:', error);
            res.status(500).json({ message: 'Failed to get suggestions from the server' });
        }
    } else {
        // Handle any other HTTP methods
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
