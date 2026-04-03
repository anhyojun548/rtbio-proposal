export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { selections } = req.body;

  if (!selections) {
    return res.status(400).json({ error: 'Missing selections' });
  }

  const labels = {
    erp: { A: '새로운 맞춤 시스템', B: '기존 ERP에 연결' },
    order: { A: '온라인 발주 시스템', B: '카카오톡 자동 접수' },
    platform: { A: '웹 기반', B: '앱 기반' },
  };

  const lines = [
    'RTBIO 업무 자동화 시스템 - 옵션 선택 결과',
    '',
    `1. 시스템 구축 방식: 옵션 ${selections.erp} — ${labels.erp[selections.erp] || '미선택'}`,
    `2. 거래처 발주 방식: 옵션 ${selections.order} — ${labels.order[selections.order] || '미선택'}`,
    `3. 사용 환경: 옵션 ${selections.platform} — ${labels.platform[selections.platform] || '미선택'}`,
    '',
    `제출 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
  ];

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RTBIO 시스템 <onboarding@resend.dev>',
        to: ['victoria@hamadalabs.com'],
        cc: ['gywns548@hamadalabs.com', 'ha.500023@hamadalabs.com'],
        subject: 'RTBIO 옵션 선택 결과',
        html: `
          <div style="font-family: -apple-system, 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1B3A5C, #2B5797); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 22px;">RTBIO 업무 자동화 시스템</h1>
              <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">옵션 선택 결과가 제출되었습니다</p>
            </div>
            <div style="background: #f8f9fb; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
              <h3 style="color: #1B3A5C; margin: 0 0 8px; font-size: 14px;">1. 시스템 구축 방식</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">옵션 ${selections.erp} — ${labels.erp[selections.erp] || '미선택'}</p>
            </div>
            <div style="background: #f8f9fb; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
              <h3 style="color: #1B3A5C; margin: 0 0 8px; font-size: 14px;">2. 거래처 발주 방식</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">옵션 ${selections.order} — ${labels.order[selections.order] || '미선택'}</p>
            </div>
            <div style="background: #f8f9fb; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
              <h3 style="color: #1B3A5C; margin: 0 0 8px; font-size: 14px;">3. 사용 환경</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">옵션 ${selections.platform} — ${labels.platform[selections.platform] || '미선택'}</p>
            </div>
            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 24px;">제출 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
          </div>
        `,
        text: lines.join('\n'),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Send error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
