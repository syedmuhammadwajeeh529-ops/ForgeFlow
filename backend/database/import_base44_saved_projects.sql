-- Optional one-time migration of the 15 SavedProject records and one ProjectVersion
-- from the original Base44 ForgeFlow app. Register first, then replace the email.
-- All legacy anonymous records are assigned to this account. Only run if yours.
USE forgeflow;
SET @forgeflow_import_email = 'REPLACE_WITH_YOUR_FORGEFLOW_EMAIL';
SET @forgeflow_user_id = (SELECT id FROM users WHERE email = @forgeflow_import_email LIMIT 1);
DROP PROCEDURE IF EXISTS import_legacy_forgeflow_projects;
DELIMITER //
CREATE PROCEDURE import_legacy_forgeflow_projects()
BEGIN
 IF @forgeflow_user_id IS NULL THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Create your ForgeFlow account and set @forgeflow_import_email before importing.';
 END IF;
 INSERT INTO saved_projects (id,idea_id,title,description,difficulty,category,tech_stack,code,language,notes,current_version,status,created_by_id,created_at,updated_at) VALUES
 ('6af9372574129d5304c4da10','m6','Plant Care Reminder','A mobile app to track houseplants, set watering reminders, and log plant health.','Beginner','Mobile',JSON_ARRAY('React Native','Notifications API','Expo'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-11-15 04:37:57','2026-11-15 04:37:57'),
 ('6a8b2c101859f3a6628bf957','s7','Event Ticketing App','A web platform to create events, sell tickets, and manage attendees with QR code check-in.','Advanced','Web',JSON_ARRAY('Next.js','Stripe','QRCode'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-08-23 17:21:20','2026-08-23 17:21:20'),
 ('6a43eb05dbd533e90700233d','m8','Language Phrase Book','A travel companion app with offline phrase packs for common languages and pronunciation audio.','Beginner','Mobile',JSON_ARRAY('React Native','Expo','AsyncStorage'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-06-30 16:12:53','2026-11-16 07:50:59'),
 ('6a3f82edf09f068144a43420','a2','Resume Analyzer','Upload a resume and get AI-powered feedback, keyword suggestions, and job match scores.','Beginner','AI',JSON_ARRAY('Python','OpenAI API','FastAPI'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-06-27 07:59:41','2026-11-16 07:50:59'),
 ('6a3f82e75b6e724111c29dc3','a6','Image Caption Generator','Upload an image and get AI-generated captions or alt-text descriptions automatically.','Intermediate','ML',JSON_ARRAY('Python','CLIP','FastAPI'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-06-27 07:59:35','2026-11-16 07:50:59'),
 ('6a3a959c428d498f873381f0','69d72988f5099e3aff209a07','2D Platformer Game','Create a classic 2D side-scrolling platformer with a player character, enemies, collectibles, and multiple levels.','Advanced','Game',JSON_ARRAY('JavaScript','Phaser.js','Canvas API'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-06-23 14:18:04','2026-06-23 14:18:04'),
 ('6a22df15b931eab824be53ea','g2','2D Platformer','A side-scrolling platformer game with levels, enemies, and collectibles built with a game engine.','Advanced','Game',JSON_ARRAY('Phaser.js','JavaScript'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-06-05 14:37:09','2026-06-05 14:37:09'),
 ('6a1dccb8db009dd3c775a368','ai-planner-0-1780337820288','Health Tracker Dashboard','A personal dashboard focused on tracking health metrics such as exercise, diet, sleep, and mood. Users can log daily activities, view trends over time, and set health-related goals.','Intermediate','Web',JSON_ARRAY('React','Node.js','MongoDB','Chart.js'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-06-01 18:17:28','2026-11-16 07:50:59'),
 ('6a1dc483747cb693f55f1396','s5','URL Shortener','A web service that creates short links with click analytics and custom slugs.','Beginner','Web',JSON_ARRAY('Node.js','Redis','React'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-06-01 17:42:27','2026-06-01 17:42:27'),
 ('6a0571d16d29cc60fcd4d86a','69d72988f5099e3aff209a03','AI Recipe Generator','Input ingredients you have and get AI-powered recipe suggestions with step-by-step instructions.','Intermediate','AI',JSON_ARRAY('Python','OpenAI API','FastAPI'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-05-14 06:55:13','2026-11-16 07:50:59'),
 ('6a0571c27ca83cb57920569a','a3','AI Meal Planner','An app that generates personalized weekly meal plans based on dietary preferences and goals.','Intermediate','AI',JSON_ARRAY('Python','OpenAI API','React'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-05-14 06:54:58','2026-11-16 07:50:59'),
 ('6a056620a4ed0fc3c37819e2','69d72988f5099e3aff209a08','Markdown Note-Taking App','A clean note-taking app with markdown rendering, folder organization, search, and local sync.','Beginner','Web',JSON_ARRAY('React','marked.js','LocalStorage'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-05-14 06:05:20','2026-11-16 07:50:59'),
 ('6a05660b1ce6bf380379631f','a5','AI Writing Assistant','A writing tool that helps rephrase, expand, or summarize text using a language model.','Beginner','AI',JSON_ARRAY('React','OpenAI API','Node.js'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-05-14 06:04:59','2026-11-16 07:50:59'),
 ('69fbff6d4488f37eaa2b63ec','d1','CSV Data Explorer','Upload a CSV file and instantly get charts, summaries, and filtering tools for your data.','Beginner','Data',JSON_ARRAY('Python','Pandas','Streamlit'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-05-07 02:56:45','2026-11-16 07:50:59'),
 ('69fbff4c0450af5918c923da','69d72988f5099e3aff209a09','Sentiment Analysis Dashboard','Analyze Twitter/news feeds for sentiment trends and visualize them on an interactive real-time dashboard.','Advanced','Data',JSON_ARRAY('Python','NLTK','Pandas','Streamlit'),'','javascript',NULL,NULL,'saved',@forgeflow_user_id,'2026-05-07 02:56:12','2026-11-16 07:50:59')
 ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description),difficulty=VALUES(difficulty),category=VALUES(category),tech_stack=VALUES(tech_stack),updated_at=VALUES(updated_at);
 INSERT INTO project_versions (id,project_id,label,code,language,notes,features,created_by_id,created_at,updated_at)
 VALUES ('6af9376ebd4ce064629e25ac','6a05660b1ce6bf380379631f','v0.1 snapshot','','javascript','Snapshot taken from current state','LLM API integration\nPrompt engineering\nStructured output parsing\nLoading & streaming states\nResult history',@forgeflow_user_id,'2026-11-15 04:39:10','2026-11-15 04:39:10')
 ON DUPLICATE KEY UPDATE label=VALUES(label),notes=VALUES(notes),features=VALUES(features),updated_at=VALUES(updated_at);
END//
DELIMITER ;
CALL import_legacy_forgeflow_projects();
DROP PROCEDURE import_legacy_forgeflow_projects;
