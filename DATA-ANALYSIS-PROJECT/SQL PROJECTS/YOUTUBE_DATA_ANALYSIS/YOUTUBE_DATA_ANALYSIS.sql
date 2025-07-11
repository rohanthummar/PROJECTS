use youtube_channel_analysis;

show tables;

select * from youtube_analytics_full_dataset;

RENAME TABLE youtube_analytics_full_dataset TO youtube_data;

Select * from youtube_data;
# FIND DUPLICATES
SELECT 
  video_id,
  sub_id,
  watch_date,
  COUNT(*) AS duplicate_count
FROM youtube_data
GROUP BY video_id, sub_id, watch_date
HAVING COUNT(*) > 1;
# MOST VIEWED VIDEOS
SELECT title, SUM(views) AS total_views
FROM youtube_data
GROUP BY title
ORDER BY total_views DESC;

# ENAGAGEMENT RATE ANALYSIS
SELECT 
  title,
  SUM(views) AS total_views,
  SUM(likes) AS total_likes,
  ROUND(SUM(likes)/SUM(views) * 1000, 2) AS engagement_per_1000
FROM youtube_data
GROUP BY title
ORDER BY engagement_per_1000 DESC;

# AVERAGE WATCH TIME 
SELECT 
  category,
  ROUND(AVG(watch_time_min), 2) AS avg_watch_time
FROM youtube_data
GROUP BY category
ORDER BY avg_watch_time DESC;

# SUBSCRIBER DISTRIBUTION BY COUNTRY
SELECT 
  country, COUNT(DISTINCT sub_id) AS total_subscribers
FROM youtube_data
GROUP BY country
ORDER BY total_subscribers DESC;

# MONTHLY SUBSCRIER JOIN TREND 
SELECT 
  DATE_FORMAT(join_date, '%Y-%m') AS month,
  COUNT(DISTINCT sub_id) AS new_subscribers
FROM youtube_data
GROUP BY month
ORDER BY month;

# MOST ENGAGED VIEWERS (TOTAL WATCH TIME)
SELECT 
  sub_id,
  SUM(watch_duration) AS total_watch_time_sec
FROM youtube_data
GROUP BY sub_id
ORDER BY total_watch_time_sec DESC
LIMIT 10;

# LIKE TI DISLIKE RATIO PER VIDEO  
SELECT 
  title,
  SUM(likes) AS total_likes,
  SUM(dislikes) AS total_dislikes,
  ROUND(SUM(likes) / NULLIF(SUM(dislikes), 0), 2) AS like_dislike_ratio
FROM youtube_data
GROUP BY title
ORDER BY like_dislike_ratio DESC;

Select * from youtube_data;