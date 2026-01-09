-- Seed reading_plan_days for Scripture Study Companion
-- Run this AFTER the main schema has been created
-- This creates day-by-day reading content for each plan

-- First, get the IDs of the existing plans
-- Note: Run SELECT * FROM reading_plans; to verify the UUIDs match

-- ============================================================================
-- CLEAR EXISTING DAYS (if re-running)
-- ============================================================================
DELETE FROM reading_plan_days;

-- ============================================================================
-- BIBLE IN A YEAR (365 days)
-- Structure: Old Testament + New Testament + Psalms/Proverbs daily
-- ============================================================================

DO $$
DECLARE
  bible_year_id UUID;
  i INTEGER;
  ot_book TEXT;
  nt_book TEXT;
  psalm_num INTEGER;
BEGIN
  -- Get the Bible in a Year plan ID
  SELECT id INTO bible_year_id FROM reading_plans WHERE name = 'Bible in a Year' LIMIT 1;

  IF bible_year_id IS NULL THEN
    RAISE EXCEPTION 'Bible in a Year plan not found';
  END IF;

  -- Generate 365 days of readings
  FOR i IN 1..365 LOOP
    INSERT INTO reading_plan_days (plan_id, day_number, passages, reflection_prompt)
    VALUES (
      bible_year_id,
      i,
      ARRAY[
        -- Old Testament progression
        CASE
          WHEN i <= 50 THEN 'Genesis ' || CEIL(i * 1.0)
          WHEN i <= 90 THEN 'Exodus ' || CEIL((i - 50) * 1.0)
          WHEN i <= 117 THEN 'Leviticus ' || CEIL((i - 90) * 1.0)
          WHEN i <= 153 THEN 'Numbers ' || CEIL((i - 117) * 1.0)
          WHEN i <= 187 THEN 'Deuteronomy ' || CEIL((i - 153) * 1.0)
          WHEN i <= 211 THEN 'Joshua ' || CEIL((i - 187) * 1.0)
          WHEN i <= 232 THEN 'Judges ' || CEIL((i - 211) * 1.0)
          WHEN i <= 236 THEN 'Ruth ' || CEIL((i - 232) * 1.0)
          WHEN i <= 267 THEN '1 Samuel ' || CEIL((i - 236) * 1.0)
          WHEN i <= 291 THEN '2 Samuel ' || CEIL((i - 267) * 1.0)
          WHEN i <= 313 THEN '1 Kings ' || CEIL((i - 291) * 1.0)
          WHEN i <= 338 THEN '2 Kings ' || CEIL((i - 313) * 1.0)
          ELSE 'Proverbs ' || ((i - 338) % 31 + 1)
        END,
        -- New Testament progression
        CASE
          WHEN i <= 28 THEN 'Matthew ' || i
          WHEN i <= 44 THEN 'Mark ' || (i - 28)
          WHEN i <= 68 THEN 'Luke ' || (i - 44)
          WHEN i <= 89 THEN 'John ' || (i - 68)
          WHEN i <= 117 THEN 'Acts ' || (i - 89)
          WHEN i <= 133 THEN 'Romans ' || (i - 117)
          WHEN i <= 149 THEN '1 Corinthians ' || (i - 133)
          WHEN i <= 162 THEN '2 Corinthians ' || (i - 149)
          WHEN i <= 168 THEN 'Galatians ' || (i - 162)
          WHEN i <= 174 THEN 'Ephesians ' || (i - 168)
          WHEN i <= 178 THEN 'Philippians ' || (i - 174)
          WHEN i <= 182 THEN 'Colossians ' || (i - 178)
          WHEN i <= 187 THEN '1 Thessalonians ' || (i - 182)
          WHEN i <= 190 THEN '2 Thessalonians ' || (i - 187)
          WHEN i <= 196 THEN '1 Timothy ' || (i - 190)
          WHEN i <= 200 THEN '2 Timothy ' || (i - 196)
          WHEN i <= 203 THEN 'Titus ' || (i - 200)
          WHEN i = 204 THEN 'Philemon 1'
          WHEN i <= 217 THEN 'Hebrews ' || (i - 204)
          WHEN i <= 222 THEN 'James ' || (i - 217)
          WHEN i <= 227 THEN '1 Peter ' || (i - 222)
          WHEN i <= 230 THEN '2 Peter ' || (i - 227)
          WHEN i <= 235 THEN '1 John ' || (i - 230)
          WHEN i = 236 THEN '2 John 1'
          WHEN i = 237 THEN '3 John 1'
          WHEN i = 238 THEN 'Jude 1'
          WHEN i <= 260 THEN 'Revelation ' || (i - 238)
          ELSE 'Review: Highlights from ' || CASE (i % 4)
            WHEN 0 THEN 'Matthew'
            WHEN 1 THEN 'Mark'
            WHEN 2 THEN 'Luke'
            ELSE 'John'
          END
        END,
        -- Psalm for the day
        'Psalm ' || ((i - 1) % 150 + 1)
      ],
      CASE (i % 5)
        WHEN 0 THEN 'What does this passage reveal about God''s faithfulness?'
        WHEN 1 THEN 'How does this reading connect to God''s overall plan of redemption?'
        WHEN 2 THEN 'What practical application can you make from today''s reading?'
        WHEN 3 THEN 'Is there a promise, command, or warning in this passage?'
        ELSE 'What stood out to you most in today''s reading?'
      END
    );
  END LOOP;
END $$;

-- ============================================================================
-- GOSPELS DEEP DIVE (90 days)
-- Structure: All 4 Gospels with reflection questions
-- ============================================================================

DO $$
DECLARE
  gospels_id UUID;
  i INTEGER;
BEGIN
  SELECT id INTO gospels_id FROM reading_plans WHERE name = 'Gospels Deep Dive' LIMIT 1;

  IF gospels_id IS NULL THEN
    RAISE EXCEPTION 'Gospels Deep Dive plan not found';
  END IF;

  FOR i IN 1..90 LOOP
    INSERT INTO reading_plan_days (plan_id, day_number, passages, reflection_prompt)
    VALUES (
      gospels_id,
      i,
      ARRAY[
        CASE
          -- Matthew (28 chapters over ~25 days)
          WHEN i <= 25 THEN 'Matthew ' || CEIL(i * 28.0 / 25)
          -- Mark (16 chapters over ~15 days)
          WHEN i <= 40 THEN 'Mark ' || CEIL((i - 25) * 16.0 / 15)
          -- Luke (24 chapters over ~25 days)
          WHEN i <= 65 THEN 'Luke ' || CEIL((i - 40) * 24.0 / 25)
          -- John (21 chapters over ~25 days)
          ELSE 'John ' || CEIL((i - 65) * 21.0 / 25)
        END
      ],
      CASE
        WHEN i <= 25 THEN
          CASE (i % 5)
            WHEN 0 THEN 'How does Matthew present Jesus as the King and Messiah?'
            WHEN 1 THEN 'What Old Testament prophecy is fulfilled in this passage?'
            WHEN 2 THEN 'What does this teach about the Kingdom of Heaven?'
            WHEN 3 THEN 'How does Jesus demonstrate authority in this chapter?'
            ELSE 'What response does Jesus call for from His disciples?'
          END
        WHEN i <= 40 THEN
          CASE ((i - 25) % 5)
            WHEN 0 THEN 'How does Mark emphasize Jesus as the Servant?'
            WHEN 1 THEN 'Notice the action words - what urgency does Mark convey?'
            WHEN 2 THEN 'How do people respond to Jesus'' miracles?'
            WHEN 3 THEN 'What does this passage reveal about discipleship?'
            ELSE 'How does Jesus show compassion in this reading?'
          END
        WHEN i <= 65 THEN
          CASE ((i - 40) % 5)
            WHEN 0 THEN 'How does Luke highlight Jesus'' concern for outcasts?'
            WHEN 1 THEN 'What role does prayer play in this passage?'
            WHEN 2 THEN 'How does Luke emphasize the Holy Spirit?'
            WHEN 3 THEN 'What does this teach about salvation for all people?'
            ELSE 'How does Jesus interact with women in this passage?'
          END
        ELSE
          CASE ((i - 65) % 5)
            WHEN 0 THEN 'What does this passage reveal about Jesus'' divine nature?'
            WHEN 1 THEN 'How does John use symbolism in this chapter?'
            WHEN 2 THEN 'What does Jesus say about Himself (I AM statements)?'
            WHEN 3 THEN 'How does belief/faith feature in this passage?'
            ELSE 'What does this teach about eternal life?'
          END
      END
    );
  END LOOP;
END $$;

-- ============================================================================
-- PSALMS & PROVERBS (31 days)
-- Structure: 5 Psalms + 1 Proverbs chapter per day
-- ============================================================================

DO $$
DECLARE
  psalms_id UUID;
  i INTEGER;
BEGIN
  SELECT id INTO psalms_id FROM reading_plans WHERE name = 'Psalms & Proverbs' LIMIT 1;

  IF psalms_id IS NULL THEN
    RAISE EXCEPTION 'Psalms & Proverbs plan not found';
  END IF;

  FOR i IN 1..31 LOOP
    INSERT INTO reading_plan_days (plan_id, day_number, passages, reflection_prompt)
    VALUES (
      psalms_id,
      i,
      ARRAY[
        'Psalm ' || i,
        'Psalm ' || (i + 30),
        'Psalm ' || (i + 60),
        'Psalm ' || (i + 90),
        'Psalm ' || (i + 120),
        'Proverbs ' || i
      ],
      CASE (i % 7)
        WHEN 0 THEN 'Which verse from today''s Psalms speaks most to your current situation?'
        WHEN 1 THEN 'What wisdom from Proverbs can you apply this week?'
        WHEN 2 THEN 'How do the Psalms express both praise and lament?'
        WHEN 3 THEN 'What does Proverbs teach about relationships?'
        WHEN 4 THEN 'Find a verse to memorize from today''s reading.'
        WHEN 5 THEN 'How do these Psalms point to Christ?'
        ELSE 'What contrast between wisdom and folly do you see in Proverbs?'
      END
    );
  END LOOP;
END $$;

-- ============================================================================
-- LENTEN JOURNEY (40 days)
-- Structure: Following Jesus from temptation to resurrection
-- ============================================================================

DO $$
DECLARE
  lenten_id UUID;
  i INTEGER;
BEGIN
  SELECT id INTO lenten_id FROM reading_plans WHERE name = 'Lenten Journey' LIMIT 1;

  IF lenten_id IS NULL THEN
    RAISE EXCEPTION 'Lenten Journey plan not found';
  END IF;

  FOR i IN 1..40 LOOP
    INSERT INTO reading_plan_days (plan_id, day_number, passages, reflection_prompt)
    VALUES (
      lenten_id,
      i,
      ARRAY[
        CASE i
          -- Week 1: Temptation and Early Ministry
          WHEN 1 THEN 'Matthew 4:1-11'
          WHEN 2 THEN 'Luke 4:14-30'
          WHEN 3 THEN 'Mark 1:14-28'
          WHEN 4 THEN 'John 2:1-12'
          WHEN 5 THEN 'Matthew 5:1-16'
          WHEN 6 THEN 'Matthew 5:17-48'
          WHEN 7 THEN 'Matthew 6:1-18'
          -- Week 2: Teaching and Miracles
          WHEN 8 THEN 'Matthew 6:19-34'
          WHEN 9 THEN 'Matthew 7:1-29'
          WHEN 10 THEN 'Mark 4:1-20'
          WHEN 11 THEN 'Mark 4:35-41'
          WHEN 12 THEN 'Mark 5:1-20'
          WHEN 13 THEN 'Mark 5:21-43'
          WHEN 14 THEN 'John 6:1-21'
          -- Week 3: Identity Revealed
          WHEN 15 THEN 'John 6:22-59'
          WHEN 16 THEN 'Matthew 16:13-28'
          WHEN 17 THEN 'Matthew 17:1-13'
          WHEN 18 THEN 'Luke 10:25-42'
          WHEN 19 THEN 'John 9:1-41'
          WHEN 20 THEN 'John 10:1-21'
          WHEN 21 THEN 'John 11:1-44'
          -- Week 4: Growing Opposition
          WHEN 22 THEN 'Luke 15:1-32'
          WHEN 23 THEN 'Luke 16:19-31'
          WHEN 24 THEN 'Luke 18:1-17'
          WHEN 25 THEN 'Luke 18:18-34'
          WHEN 26 THEN 'Luke 19:1-27'
          WHEN 27 THEN 'Matthew 20:20-34'
          WHEN 28 THEN 'John 12:1-19'
          -- Week 5: Final Week in Jerusalem
          WHEN 29 THEN 'Matthew 21:1-17'
          WHEN 30 THEN 'Matthew 21:23-46'
          WHEN 31 THEN 'Matthew 22:15-46'
          WHEN 32 THEN 'Matthew 23:1-39'
          WHEN 33 THEN 'Matthew 24:1-31'
          WHEN 34 THEN 'Matthew 25:1-30'
          WHEN 35 THEN 'Matthew 25:31-46'
          -- Holy Week
          WHEN 36 THEN 'John 13:1-30'
          WHEN 37 THEN 'John 14:1-31'
          WHEN 38 THEN 'John 15:1-17'
          WHEN 39 THEN 'Matthew 26:36-75'
          WHEN 40 THEN 'Matthew 27:1-66'
          ELSE 'Luke 24:1-12'
        END
      ],
      CASE
        WHEN i <= 7 THEN 'How does Jesus face temptation, and what can we learn?'
        WHEN i <= 14 THEN 'What does this miracle or teaching reveal about Jesus'' mission?'
        WHEN i <= 21 THEN 'How is Jesus'' true identity being revealed?'
        WHEN i <= 28 THEN 'How does Jesus respond to opposition and unbelief?'
        WHEN i <= 35 THEN 'What warnings and promises does Jesus give about the future?'
        ELSE 'Meditate on Jesus'' suffering and sacrifice for you.'
      END
    );
  END LOOP;
END $$;

-- ============================================================================
-- VERIFY THE DATA
-- ============================================================================

-- Check counts
SELECT
  rp.name,
  rp.duration_days,
  COUNT(rpd.id) as days_created
FROM reading_plans rp
LEFT JOIN reading_plan_days rpd ON rp.id = rpd.plan_id
GROUP BY rp.id, rp.name, rp.duration_days
ORDER BY rp.name;
