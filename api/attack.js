// api/attack.js 수정본 (가장 안전한 형태)
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { skillName } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "API 키가 설정되지 않았습니다." });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `다음 게임 스킬을 평가해서 JSON으로 답해: ${skillName}. 형식: {"damage": 숫자, "critical": 불리언, "description": "설명"}` }] }]
            })
        });

        const data = await response.json();
        
        // 만약 구글 API에서 에러를 뱉었다면?
        if (data.error) {
            return res.status(data.error.code || 500).json(data.error);
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
