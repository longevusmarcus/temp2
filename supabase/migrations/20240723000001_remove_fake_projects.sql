-- Remove any projects that were not created through the payment process
-- These would be the initial fake projects with numeric IDs

DELETE FROM projects 
WHERE id::text ~ '^[0-9]+$' OR id IN ('1', '2', '3', '4', '5', '6');

-- If there are any other fake projects you want to remove, you can add their IDs here
-- DELETE FROM projects WHERE id IN ('specific-uuid-1', 'specific-uuid-2');
