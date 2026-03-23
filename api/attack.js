module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
    }

    const { skillName } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API 키가 없습니다.' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `당신은 귀엽고 힐링되는 먹방 게임의 판정관입니다. 보스는 '잔뜩 화가 난 배고픈 뚱냥이'입니다.
                        플레이어(집사)가 고양이를 달래기 위해 다음 요리나 간식을 대접했습니다: "${skillName}"
                        
                        이 메뉴가 얼마나 맛있고 정성스러운지, 고양이의 취향을 얼마나 저격했는지 평가해서 고양이의 '배고픔 수치'를 얼마나 깎을지 결정하세요.
                        반드시 아래 JSON 형식으로만 딱 답변하세요. 절대 마크다운을 쓰지 마세요.
                        {"damage": 포만감수치(배고픔을 깎는 양, 1~3000), "critical": true또는false, "description": "고양이가 요리를 먹고 보이는 아주 귀엽고 사랑스러운 리액션 멘트 (예: 꼬리를 바짝 세우고 골골송을 부르며 흡입합니다!)"}`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini 에러:", data.error);
            return res.status(500).json({ error: 'Gemini 통신 에러' });
        }

        let text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error("JSON 데이터를 찾을 수 없습니다.");
        }

        const parsedData = JSON.parse(jsonMatch[0]);
        res.status(200).json(parsedData);

    } catch (error) {
        console.error("서버 파싱 에러:", error);
        res.status(500).json({ error: '서버 데이터 처리 에러' });
    }
};
