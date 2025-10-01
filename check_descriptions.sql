SELECT 
  source,
  COUNT(*) as total_count,
  COUNT(CASE WHEN LENGTH(description) < 500 THEN 1 END) as short_descriptions,
  COUNT(CASE WHEN description LIKE '%Exciting opportunity for a%' OR description LIKE '%is seeking a%' OR description LIKE '%&lt;div%' THEN 1 END) as needs_update
FROM Job 
WHERE description IS NOT NULL 
GROUP BY source 
ORDER BY needs_update DESC;