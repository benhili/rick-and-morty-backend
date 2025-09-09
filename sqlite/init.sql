-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  species TEXT NOT NULL,
  type TEXT DEFAULT '',
  gender TEXT NOT NULL,
  origin_name TEXT DEFAULT '',
  origin_url TEXT DEFAULT '',
  location_name TEXT DEFAULT '',
  location_url TEXT DEFAULT '',
  image TEXT DEFAULT '',
  created TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample Rick and Morty characters
INSERT OR IGNORE INTO characters (id, name, status, species, gender) VALUES
(1, 'Rick Sanchez', 'Alive', 'Human', 'Male'),
(2, 'Morty Smith', 'Alive', 'Human', 'Male'),
(3, 'Summer Smith', 'Alive', 'Human', 'Female'),
(4, 'Beth Smith', 'Alive', 'Human', 'Female'),
(5, 'Jerry Smith', 'Alive', 'Human', 'Male'),
(6, 'Abadango Cluster Princess', 'Alive', 'Alien', 'Female'),
(7, 'Abradolf Lincler', 'Unknown', 'Human', 'Male'),
(8, 'Adjudicator Rick', 'Dead', 'Human', 'Male'),
(9, 'Agency Director', 'Dead', 'Human', 'Male'),
(10, 'Alan Rails', 'Dead', 'Human', 'Male');
