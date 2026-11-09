import { userRoute } from '../../config/db.js';

/* ------------------------------------------------------------------ */
/* GET /api/ai/accuracy — did the AI's suggested priority match the    */
/* reviewer's final call?                                             */
/*                                                                    */
/* Compares the latest ai_analyses.priority_prediction per report      */
/* against the priority of the incident the reviewer verified it      */
/* into (the incident priority is the human's word: the reviewer's    */
/* explicit override, else the SQL-scored report priority). Also      */
/* split by engine (llm vs rules) so the value of the model over the  */
/* fallback is measurable, not assumed.                               */
/* ------------------------------------------------------------------ */
export const accuracy = userRoute(async (_req, res, client) => {
  const { rows } = await client.query(
    `WITH latest_ai AS (
       SELECT DISTINCT ON (report_id)
              report_id, priority_prediction, reasoning->>'engine' AS engine
         FROM ai_analyses
        WHERE priority_prediction IS NOT NULL
        ORDER BY report_id, created_at DESC
     ),
     compared AS (
       SELECT a.engine,
              (a.priority_prediction = i.priority_id) AS agreed,
              (i.verified_at >= date_trunc('month', now())) AS this_month
         FROM incidents i
         JOIN latest_ai a ON a.report_id = i.report_id
        WHERE i.verified_at IS NOT NULL
     )
     SELECT engine,
            count(*)                                      AS total,
            count(*) FILTER (WHERE agreed)                AS agreed,
            count(*) FILTER (WHERE this_month)            AS month_total,
            count(*) FILTER (WHERE this_month AND agreed) AS month_agreed
       FROM compared
      GROUP BY engine`
  );

  const sum = (key) => rows.reduce((n, r) => n + Number(r[key] || 0), 0);
  const rate = (agreed, total) => (total ? Math.round((agreed / total) * 100) : null);

  const allTime = { agreed: sum('agreed'), total: sum('total') };
  const month = { agreed: sum('month_agreed'), total: sum('month_total') };

  res.json({
    month: { ...month, rate: rate(month.agreed, month.total) },
    allTime: { ...allTime, rate: rate(allTime.agreed, allTime.total) },
    byEngine: rows
      .map((r) => ({
        engine: r.engine || 'unknown',
        total: Number(r.total),
        agreed: Number(r.agreed),
        rate: rate(Number(r.agreed), Number(r.total)),
      }))
      .sort((a, b) => b.total - a.total),
  });
});
