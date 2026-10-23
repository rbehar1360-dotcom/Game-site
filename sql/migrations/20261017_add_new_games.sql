-- Add the 22 games whose cards were added to the homepage.
-- Image values are intentionally empty so you can add your chosen image paths.
-- Existing rows with matching IDs are left unchanged.
INSERT INTO public.games (id, name, url, image)
VALUES
    ('60Seconds', '60 Seconds', 'games/60Seconds.html', ''),
    ('2048', '2048', 'games/2048.html', ''),
    ('AdventureCapitalist', 'Adventure Capitalist', 'games/AdventureCapitalist.html', ''),
    ('BadPiggies', 'Bad Piggies', 'games/BadPiggies.html', ''),
    ('BaldisBasics', 'Baldi''s Basics', 'games/BaldisBasics.html', ''),
    ('Bloxorz', 'Bloxorz', 'games/Bloxorz.html', ''),
    ('BSR', 'BSR', 'games/BSR.html', ''),
    ('CandyCrush', 'Candy Crush', 'games/CandyCrush.html', ''),
    ('CutTheRope', 'Cut the Rope', 'games/CutTheRope.html', ''),
    ('Dalgona', 'Dalgona', 'games/Dalgona.html', ''),
    ('DrawRunner', 'Draw Runner', 'games/DrawRunner.html', ''),
    ('DumbWaysToDie', 'Dumb Ways to Die', 'games/DumbWaysToDie.html', ''),
    ('FlappyBird', 'Flappy Bird', 'games/FlappyBird.html', ''),
    ('GettingOverIt', 'Getting Over It', 'games/GettingOverIt.html', ''),
    ('GoogleBaseBall', 'Google Base Ball', 'games/GoogleBaseBall.html', ''),
    ('HollowKnight', 'Hollow Knight', 'games/HollowKnight.html', ''),
    ('Kindergarten', 'Kindergarten', 'games/Kindergarten.html', ''),
    ('Kindergarten2', 'Kindergarten 2', 'games/Kindergarten2.html', ''),
    ('Kindergarten3', 'Kindergarten 3', 'games/Kindergarten3.html', ''),
    ('PizzeriaSim', 'Pizzeria Sim', 'games/PizzeriaSim.html', ''),
    ('RedBall4', 'Red Ball 4', 'games/RedBall4.html', ''),
    ('Terraria', 'Terraria', 'games/Terraria.html', '')
ON CONFLICT (id) DO NOTHING;
