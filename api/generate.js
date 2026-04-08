export default async function handler(req, res) {
    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-5.4-mini",
            input: req.body.prompt
        })
    });

    const data = await response.json();
    res.status(200).json(data);
}
