/*
  # Remove activity type constraint
  
  1. Changes
    - Drop the check constraint on account_activities.activity_type
    - This allows any text value to be entered for activity_type instead of being limited to predefined values
  
  2. Reason
    - User needs flexibility to enter custom activity types as free text
*/

ALTER TABLE account_activities 
DROP CONSTRAINT IF EXISTS account_activities_activity_type_check;
