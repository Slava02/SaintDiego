SET FOREIGN_KEY_CHECKS = 0;
--bun:split
DROP TABLE IF EXISTS `time_slot_service`;
--bun:split
DROP TABLE IF EXISTS `time_slot_recurrence`;
--bun:split
DROP TABLE IF EXISTS `time_slot`;
--bun:split
DROP TABLE IF EXISTS `location`;
--bun:split
DROP TABLE IF EXISTS `event_client`;
--bun:split
DROP TABLE IF EXISTS `event`;
--bun:split
DROP TABLE IF EXISTS `volounteer`;
--bun:split
DROP TABLE IF EXISTS `client_service_history`;
--bun:split
DROP TABLE IF EXISTS `client_settings`;
--bun:split
DROP TABLE IF EXISTS `service_type_settings`;
--bun:split
ALTER TABLE `client` DROP COLUMN IF EXISTS `is_blocked`;
--bun:split
ALTER TABLE `client` DROP COLUMN IF EXISTS `blocked_reason`;
--bun:split
ALTER TABLE `client` DROP COLUMN IF EXISTS `blocked_at`;
--bun:split
SET FOREIGN_KEY_CHECKS = 1;