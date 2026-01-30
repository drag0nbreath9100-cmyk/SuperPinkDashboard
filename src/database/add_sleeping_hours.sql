-- Add sleeping_hours column to checkins table
ALTER TABLE checkins 
ADD COLUMN sleeping_hours NUMERIC DEFAULT 0;

-- Comment describing the column
COMMENT ON COLUMN checkins.sleeping_hours IS 'Number of hours sleep obtained the previous night';
