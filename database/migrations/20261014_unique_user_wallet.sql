-- Clear the demo wallet values so these accounts must bind a real wallet.
UPDATE users
SET wallet_address = NULL
WHERE (email = 'admin@school.edu.vn' AND wallet_address = '0xA3f2d9b7eC81452D819280dEAc429e81')
   OR (email = 'officer@school.edu.vn' AND wallet_address = '0xB821c9e4a11295D31918aC391e82A123');

-- Multiple NULL values are allowed; each linked address can belong to one user.
ALTER TABLE users
ADD CONSTRAINT uq_users_wallet_address UNIQUE (wallet_address);
