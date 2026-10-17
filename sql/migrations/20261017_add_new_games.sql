-- Add the 22 games whose cards were added to the homepage.
-- Image values are intentionally empty so you can add your chosen image paths.
-- Existing rows with matching IDs are left unchanged.
INSERT INTO public.games (id, name, url, image)
VALUES
    ('AngryBirds', 'Angry Birds', 'games/clangrybirds.html', ''),
    ('AngryBirds2', 'Angry Birds 2', 'games/clangrybirds2.html', ''),
    ('BindingOfIsaac', 'Binding of Isaac', 'games/clbindingofisaccsheeptime.html', ''),
    ('BitLife', 'Bit Life', 'games/clbitlife.html', ''),
    ('BlockBlast', 'Block Blast', 'games/clblockblast.html', ''),
    ('BlockBlast2', 'Block Blast 2', 'games/clblockblastv2.html', ''),
    ('BTD1', 'BTD1', 'games/clbloonsTD1.html', ''),
    ('BTD2', 'BTD2', 'games/clbloonsTD2.html', ''),
    ('BTD3', 'BTD3', 'games/clbloonsTD3.html', ''),
    ('BTD4', 'BTD4', 'games/clbloonsTD4.html', ''),
    ('BTD5', 'BTD5', 'games/clbtd5.html', ''),
    ('CapyClicker', 'CapyClicker', 'games/clcapybaraclicker.html', ''),
    ('CoreBall', 'CoreBall', 'games/clcoreball.html', ''),
    ('ImpossibleQuiz', 'Impossible Quiz', 'games/climpossiblequiz.html', ''),
    ('Run2', 'Run 2', 'games/clrun-2.html', ''),
    ('Run1', 'Run 1', 'games/clrun.html', ''),
    ('StreetFighter2', 'Street Fighter 2', 'games/clStreetFighter2Arcade.html', ''),
    ('DoodleJump', 'Doodle Jump', 'games/doodle-jump.html', ''),
    ('Plinko', 'Plinko', 'games/plinko.html', ''),
    ('PokemonEmerald', 'Pokemon Emerald', 'games/pokemon-emerald.html', ''),
    ('GoogleFeud', 'Google Feud', 'games/google-feud.html', ''),
    ('Wordle', 'Wordle', 'games/wordle.html', '')
ON CONFLICT (id) DO NOTHING;
