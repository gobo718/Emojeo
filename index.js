/* Genreactrix AI Worker v0.9.6.51-prompt-diagnostics-component-heading-recovery
   Registry-driven replacement Worker.
   Source vocabulary is generated from primfusion-registry.json.
*/
const API_VERSION = '0.9.6.51-prompt-diagnostics-component-heading-recovery';
const DEFAULT_MODEL = '@cf/meta/llama-3.2-11b-vision-instruct';
// Description-only Reaction analysis keeps the structured-output model used by v0.9.6.31.
const DEFAULT_REACTION_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';
const COMPONENT_IDS = ['reactions','themes','description','reactionReasons','genreReasons'];
const CUSTOM_THEME_GENERATION_ENABLED = false;
const PROVIDER_CALL_TIMEOUT_MS = 45000;
const PROMPT_DIAGNOSTIC_PROVIDER_CALL_TIMEOUT_MS = 90000;

const cors = {
  'access-control-allow-origin':'*',
  'access-control-allow-methods':'GET, POST, OPTIONS',
  'access-control-allow-headers':'content-type, x-analysis-key'
};

const json = (body, init={}) => new Response(JSON.stringify(body), {
  ...init,
  headers:{...cors,'content-type':'application/json; charset=utf-8',...(init.headers||{})}
});

const PRIMFUSION_REGISTRY = {"schemaVersion":1,"matrixVersion":"0.0.0.0","latestVersion":"0.0.0.0","codingRules":{"primFusionPrefix":"PFM","fusionPrimOrder":"ascending numeric primitive ID","pairOrderIndependent":true,"fusionCodesExcludeSelfPairs":true,"themeChoiceCount":105,"primCount":14,"fusionCount":91,"aiThemeChoiceCount":91},"researchRules":{"reactionAndThemeAnalysesIndependent":true,"reactionCodesAreReturnIdentifiersNotThemeReasoningInputs":true,"themeSelectionUsesCurrentMatrixVocabulary":true,"customThemeFallbackAllowed":false,"customThemeUseOrCreationTriggers":["AutoKeep","AutoFlag"],"aiThemeSelectionUsesFusionVocabularyOnly":true,"standalonePrimThemesExcludedFromAiThemeSelection":true},"source":{"kind":"live-site-app-js","repository":"gobo718/Genreactrix-","path":"app.js","extractedUtc":"2026-08-09T05:59:12.571064+00:00","note":"Fusion vocabulary synchronized to PRIMFUSION_THEME_DEFINITIONS-v0.0.0.0. Pre-lock semantic calibration includes locked PFM0309 Humiliation wording, PFM0110 is redefined as UglyCute, and targeted gates/refinements for Saccharine, Surreal, Liminal, Zany, Grossout, Freakshow, Parodic, Limerence, Horror, Obsessive, UglyCute, Goofy, Playful, and Snarky. Prompt Diagnostics uses stricter evidence fidelity, target isolation, confidence calibration, and contradiction repair. Matrix remains 0.0.0.0 until test-era reports are wiped and the historical baseline is locked."},"primitives":[{"id":"P01","name":"Adorable","symbol":"🧸","aiMeaning":"Distinct cuteness or endearment that produces an “aww,” nurturing, protective, cuddling, baby-schema, precious, or irresistibly lovable response. Adorable is a narrow reaction to cuteness itself, not a general positive reaction to something pleasant, attractive, friendly, soft, or beautiful.\nRequired gate: Adorable should be supported only when the image contains clear cuteness-specific evidence. Valid routes include juvenile or baby-like traits, baby-schema proportions, tiny vulnerable proportions, plush or toy-like forms, cuddly presentation, affectionate dependence, innocent vulnerability, endearing clumsiness, deliberately cute or kawaii styling, or behavior that specifically evokes caretaking, cuddling, or an “aww” response.\nEvidence can include: Babies or visibly juvenile animals; disproportionately large eyes or head; round cheeks or face; small nose or mouth; tiny paws, limbs, or features; oversized ears; compact or chubby proportions; plushness; stuffed animals; cuddling; being held or cared for; shy, clumsy, dependent, trusting, or affection-seeking behavior; miniature versions of familiar things; cute costumes or accessories; and overt visual design intended to make a subject look precious, huggable, or childlike.\nHard non-qualifiers: Do not score Adorable merely because a subject is beautiful, attractive, smiling, friendly, harmless, pleasant, colorful, soft-lit, cozy, sentimental, feminine, small, young-looking, innocent-looking, or aesthetically pleasing. Smallness alone is not Adorable. Softness alone is not Adorable. Roundness alone is not Adorable. An animal or pet is not automatically Adorable. A cartoon or illustration is not automatically Adorable. A smiling or attractive adult is not Adorable without independent cuteness-specific evidence.\nAnti-fallback rule: Adorable must not be used as a safe default for positive images or as a substitute for Beautiful, Dreamy, Celebration, Zazzly, or general likability. If the image remains appealing after its specifically cute, juvenile, cuddly, vulnerable, or precious qualities are removed, that remaining appeal belongs to another reaction rather than Adorable.\n🧸 Emoji contribution: Teddy bears, stuffed animals, nursery objects, childhood keepsakes, cuddling, soft stuffed forms, being held or cared for, huggability, and sentimental affection reinforce Adorable only when they actively create cuteness, endearment, preciousness, cuddly appeal, or lovable vulnerability. Their mere presence is not sufficient."},{"id":"P02","name":"Beautiful","symbol":"✨","aiMeaning":"Aesthetic beauty from scenery, art, color, light, composition, harmony, symmetry, elegance, radiance, craftsmanship, architecture, design, polish, refinement, or overall visual presentation.\nHard boundary: Do not score Beautiful from a person's face, body, physique, skin, curves, musculature, clothing, pose, nudity, exposed skin, revealing or tight clothing, sensual presentation, or physical attractiveness. The presence or attractiveness of a person is not evidence for Beautiful. Human physical desirability and body-focused appeal belong to Zazzly.\nBeautiful may still score when non-human visual qualities of the image itself independently support it, such as scenery, composition, color, lighting, architecture, art, design, craftsmanship, symmetry, harmony, polish, or refinement."},{"id":"P03","name":"Tragic","symbol":"😭","aiMeaning":"Sadness, grief, loss, suffering, heartbreak, loneliness, helplessness, regret, emotional pain, sorrow, mourning, or sympathy for misfortune.\nEvidence can include: Crying, injury, death, abandonment, ruin, rejection, isolation, mourning, damaged relationships, painful circumstances, visible sorrow, grief-stricken expressions, or situations that evoke compassion for suffering.\n😭 Emoji contribution: Streaming tears, sobbing, emotional collapse, pleading expressions, devastation, heartbreak, helplessness, cathartic grief, painful emotional overflow, inconsolability, or being emotionally overwhelmed by suffering or loss can reinforce Tragic."},{"id":"P04","name":"Funny","symbol":"🤣","aiMeaning":"Humor, amusement, silliness, absurdity, comic surprise, awkward comedy, wit, ridiculousness, playful nonsense, or anything that provokes laughter.\nEvidence can include: Expressions, poses, comic mishaps, jokes, visual puns, incongruity, exaggeration, slapstick, meme-like situations, embarrassing moments, ridiculous reactions, or behavior whose absurdity or incongruity produces amusement.\n🤣 Emoji contribution: Doubled-over laughter, tears of laughter, losing composure, slapstick payoff, ridiculous reactions, meme exaggeration, explosive amusement, contagious laughter, punch-line energy, and scenes that feel impossible to take seriously can reinforce Funny."},{"id":"P05","name":"Intense","symbol":"💥","aiMeaning":"Force, energy, drama, urgency, extremity, power, impact, excitement, danger, speed, violence, passion, tension, chaos, pressure, adrenaline, volatility, sensory overload, or emotional extremity.\nEvidence can include: Explosions, action, confrontation, extreme expressions, dramatic motion, powerful bodies, storms, spectacle, high stakes, tense stand-offs, chaotic environments, sudden escalation, overwhelming sensory presence, or visually forceful scenes.\n💥 Emoji contribution: Explosions, collisions, impacts, crashes, strikes, bursts, breakage, shock waves, blasts, comic-book action marks, sudden escalation, kinetic force, loudness, urgency, disruption, and moments that visually land hard can reinforce Intense."},{"id":"P06","name":"Weird","symbol":"🌀","aiMeaning":"Strangeness, oddity, uncanniness, abnormality, eccentricity, unpredictability, surrealism, mutation, bizarre combinations, perceptual wrongness, or departure from ordinary expectations.\nEvidence can include: Unusual bodies, strange objects, impossible scenes, mismatched elements, distortions, peculiar behavior, unfamiliar forms, uncanny juxtapositions, reality-bending imagery, or anything that makes the viewer think “what the hell?”\n🌀 Emoji contribution: Spirals, vortices, whirlpools, warped perspective, trippy visual effects, looping motion, hypnosis imagery, dizziness, disorientation, perceptual instability, twisting forms, altered orientation, and a sense that reality is slipping out of alignment can reinforce Weird."},{"id":"P07","name":"Ticket","symbol":"🎟️","aiMeaning":"Inappropriate amusement, callousness, taboo enjoyment, schadenfreude, morbid fascination, cruel humor, social transgression, laughing at things that should not be funny, or emotional responses wildly opposed to what society considers acceptable. This captures enjoying cruelty, laughing at tragedy, amusement where empathy is expected, fascination with disturbing material, or reactions that sharply violate social norms.\nEvidence can include: Cruel or humiliating situations treated as entertainment, another person’s misfortune producing amusement, taboo spectacle, train-wreck fascination, vulgar or outrageous behavior, disturbing material that is compelling to watch, social boundary violations, or enjoyment that conflicts sharply with expected empathy or decorum.\n🎟️ Emoji contribution: Admission tickets, event entry, spectatorship, paying to watch, carnival or sideshow imagery, being granted a pass, and metaphorically buying admission to a questionable spectacle can reinforce Ticket through willing spectatorship, complicity, taboo entertainment, or attraction to material that violates social expectations."},{"id":"P08","name":"Dreamy","symbol":"🌌","aiMeaning":"Fantasy, reverie, wonder, escapism, imagination, enchantment, altered reality, surrealism, nostalgia, longing, dream-state, or otherworldliness.\nEvidence can include: Fantasy worlds, impossible landscapes, ethereal or unreal spaces, magical imagery, mist, stars, celestial vistas, altered environments, nostalgic imagery, imaginative transformations, distant horizons, contemplative unreality, dream logic, or scenes that feel transported beyond ordinary life.\n🌌 Emoji contribution: The Milky Way, stars, galaxies, deep night sky, cosmic landscapes, space, distant lights, celestial scale, infinity, mystery, transcendence, cosmic wonder, science-fiction vistas, human smallness before a vast universe, and transportive otherworldliness can reinforce Dreamy."},{"id":"P09","name":"Zazzly","symbol":"🌶️","aiMeaning":"Sexual salience, erotic appeal, physical desirability, horniness, seductive or provocative presentation, body-focused attraction, flirtation, sexual tension, or imagery likely to be perceived as sexy, hot, spicy, revealing, tempting, or turn-on oriented.\nEvidence includes nudity or partial nudity; exposed chest, breasts, nipples, buttocks, crotch, genitals, pubic area, torso, or abundant skin; prominently displayed sexually salient body parts or features such as pecs, abs, hips, thighs, legs, curves, musculature, physique, body proportions, or large or emphasized buttocks. It also includes tight or form-fitting clothing, leggings, compression wear, singlets, athletic outfits, uniforms, body-hugging costumes, underwear, lingerie, briefs, boxers, panties, thongs, jockstraps, bikinis, speedos, revealing swimwear, mesh, sheer clothing, towels, robes, bedsheet coverage, or clothing that reveals, frames, or emphasizes the body.\nBody-display routes include mirror selfies, nude or shirtless selfies, underwear selfies, gym, bathroom, or bedroom selfies, thirst traps, posed body shots, flexing, arching, spread or open-leg posing, chest-, butt-, crotch-, or physique-focused framing, and deliberate body display. Exposure routes include casual or public nudity, nude beaches, skinny-dipping, streaking, flashing, deliberate exposure, undressing, changing clothes, locker-room or shower scenes, towel scenes, wet skin, wet clothing, exhibitionistic display, or being intentionally seen naked or partly naked. Sensual routes include intimate or flirtatious gaze, teasing, provocative expressions, erotic or fetish styling, suggestive framing, seductive atmosphere, or visible sexual tension.\nExpansion rule: Zazzly does not require sexual activity, explicit arousal, a stereotypically seductive pose, fetish content, or an invitation to sex. Casual nudity independently supports Zazzly. Any mirror selfie independently supports at least some Zazzly because it is deliberate self-presentation and body display, even when fully clothed or not overtly sexual. Any adult body type may qualify when sexual or sensual presentation is visually emphasized. Beautiful may score separately for non-human aesthetics, but it must not replace or suppress Zazzly when sexual salience is present.\nAge gate: Apply sexualized Zazzly interpretation only to adult subjects. Do not infer sexual attractiveness or erotic appeal from minors.","publicMeaningHidden":true},{"id":"P10","name":"Disgusting","symbol":"🤢","aiMeaning":"Disgust, revulsion, nausea, contamination, filth, bodily aversion, decay, grossness, gross-out reaction, grotesque unpleasantness, moral revulsion, or an instinctive desire to recoil.\nEvidence can include: Rot, slime, wounds, bodily fluids, spoiled food, parasites, infection, excrement, gore, grime, malformed organic matter, contamination, foul substances, or anything viscerally gross.\n🤢 Emoji contribution: A nauseated face, sickness, gagging, queasiness, foul smells, spoiled food, poisoning, infection, toxic substances, bodily illness, rancidness, contamination, and cues that trigger physical recoil or a “that makes me sick” response can reinforce Disgusting."},{"id":"P11","name":"Scary","symbol":"👻","aiMeaning":"Fear, dread, unease, threat, suspense, vulnerability, danger, horror, paranoia, menace, foreboding, creepiness, alarm, or anticipation that something harmful or uncanny may happen.\nEvidence can include: Monsters, darkness, weapons, threatening people, isolation, disturbing faces, supernatural imagery, stalking, dangerous environments, ominous situations, unseen threats, predatory presence, eerie emptiness, or subtle wrongness.\n👻 Emoji contribution: Ghosts, spirits, apparitions, haunted places, spectral figures, paranormal presences, unseen watchers, Halloween imagery, death or afterlife imagery, jump-scare cues, spooky playfulness, eerie presence, haunting, supernatural unease, and something impossible appearing where it should not be can reinforce Scary."},{"id":"P12","name":"Smart","symbol":"🧠","aiMeaning":"Intelligence, thought, cognition, knowledge, cleverness, psychology, conceptual complexity, strategy, learning, insight, invention, ingenuity, reasoning, intellectual curiosity, mental effort, or fascination with how minds work.\nEvidence can include: Science, mathematics, books, puzzles, planning, symbolism, intellectual humor, psychological states, technical or computational reasoning, ingenious design, problem-solving, conceptual cleverness, visibly thoughtful behavior, learning, analysis, or evidence of deliberate mental work.\n🧠 Emoji contribution: The literal brain, anatomy, neuroscience, neural imagery, memory, cognition, consciousness, psychology, thought diagrams, brain scans, artificial intelligence, mind maps, “big brain” cleverness, overthinking, strategy, introspection, mental effort, and curiosity about how thought works can reinforce Smart."},{"id":"P13","name":"Celebration","symbol":"🎉","aiMeaning":"Happiness expressed through celebration, festivity, achievement, gathering, excitement, communal joy, triumph, revelry, applause, victory, milestones, special occasions, or marking something positively significant.\nEvidence can include: Parties, cheering, dancing, birthdays, holidays, weddings, trophies, confetti, decorations, crowds, congratulations, victories, launches, awards, good-news announcements, milestone moments, or ceremonies and rituals presented as celebratory.\n🎉 Emoji contribution: Party poppers, confetti, streamers, congratulatory bursts, surprise announcements, party supplies, victories, birthdays, milestones, launches, applause, achievements, “yay!” energy, and visible moments of good news or success can reinforce Celebration."},{"id":"P14","name":"Angry","symbol":"🤬","aiMeaning":"Anger, annoyance, irritation, aggravation, frustration, hostility, resentment, defiance, confrontation, outrage, aggression, rage, feeling fed up, or the reaction that something “pisses you off.”\nEvidence can include: Annoyed or furious expressions, yelling, arguing, clenched fists, hostile gestures, threats, fighting, destruction, revenge behavior, protest, intimidation, antagonism, simmering resentment, visible frustration, or escalating confrontation.\n🤬 Emoji contribution: An enraged face, censored symbols over the mouth, shouting, profanity, swearing, rants, insults, verbal confrontation, explosive facial expressions, exasperation, being fed up, loss of polite restraint, censored verbal aggression, and cartoon rage can reinforce Angry across the spectrum from irritation to fury."}],"fusions":[{"code":"PFM0102","name":"Cozy","primIds":["P01","P02"],"matrixVersion":"0.0.0.0","aiMeaning":"Comforting, snug, warm, sheltered, or inviting; soft textures, warm lighting, blankets, relaxed intimate settings, or a feeling of ease, rest, or pleasant closeness."},{"code":"PFM0103","name":"Pitiful","primIds":["P01","P03"],"matrixVersion":"0.0.0.0","aiMeaning":"Arousing sympathy or compassion through visible helplessness, suffering, misfortune, weakness, neglect, injury, abandonment, or pleading."},{"code":"PFM0104","name":"Goofy","primIds":["P01","P04"],"matrixVersion":"0.0.0.0","aiMeaning":"Silly, awkward, playful, foolish, or ridiculous in an amusing way; exaggerated expressions, clumsy antics, or playful visual absurdity.\nGate: Ordinary resting, reclining, standing, sitting, relaxation, incidental awkwardness, clutter, or an unusual-looking scene is not Goofy by itself. Goofy requires actual amusing silliness, foolishness, clumsy antics, playful absurdity, exaggerated comic behavior or expression, or comparable laughter-producing incongruity. Do not infer playfulness merely from relaxation, mess, or an ordinary pose."},{"code":"PFM0105","name":"Joy","primIds":["P01","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Happiness, delight, pleasure, or emotional uplift shown through smiling, laughter, delighted expressions, playful pleasure, or visible enjoyment."},{"code":"PFM0106","name":"Bizarre","primIds":["P01","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Strange, unusual, unexpected, peculiar; improbable combinations, anomalous forms, or unexplained oddities."},{"code":"PFM0107","name":"Camp","primIds":["P01","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Exaggerated, theatrical, artificial, flamboyant, kitschy, or knowingly excessive styling and presentation."},{"code":"PFM0108","name":"Whimsical","primIds":["P01","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Fanciful, playful, imaginative, lightly odd, or guided by charming logic; fantasy details, charming oddities, or impossible elements."},{"code":"PFM0109","name":"Kawaii","primIds":["P01","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Highly stylized Japanese cute aesthetic using exaggerated sweetness or toy-like, childlike, or chibi-style proportions."},{"code":"PFM0110","name":"UglyCute","primIds":["P01","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"“So ugly it’s cute” appeal: unattractive, awkward, scruffy, misshapen, grotesque, gross-looking, or otherwise visually off-putting qualities that become endearing, charming, funny, lovable, or cute; the ugliness or ickiness is itself part of the appeal.\nEvidence can include troll-like dolls, scruffy animals, odd little creatures, misshapen toys, awkward faces or proportions, strange character designs, or other subjects whose off-putting features actively increase their endearment.\nGate: Dirt, grime, filth, clutter, ugliness, disgust, or cuteness alone is not UglyCute. The image must combine genuine off-putting, ugly, or icky qualities with genuine cute or endearing appeal, and the undesirable quality must contribute to the affection rather than merely coexist with it."},{"code":"PFM0111","name":"CreepyCute","primIds":["P01","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Cute and unsettling at once; Halloween fun. Appealing subjects combined with eerie, spooky, uncanny, or disturbing features."},{"code":"PFM0112","name":"Innocence","primIds":["P01","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Openness, inexperience, trust, simplicity, or freedom from corruption; childlike expressions, gentleness, or naive imagery."},{"code":"PFM0113","name":"Playful","primIds":["P01","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Lighthearted, mischievous, teasing, game-like, curious, imaginative, or inclined toward fun and experimentation; playful role-taking, dress-up, character customization, make-believe, games, toys, teasing gestures, spontaneous fun, or deliberately fun self-presentation.\nClarification: Playful does not require laughter, toys, overt antics, or childish behavior. Role-play, dress-up, character experimentation, and deliberately fun or lighthearted presentation can independently support Playful when they function as play."},{"code":"PFM0114","name":"Saccharine","primIds":["P01","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Excessively sweet, sentimental, precious, or cutesy to the point of irritation; sugary, pastel, cloying, aggressively sweet imagery.\nGate: “Excessive” means excessive sweetness, sentimentality, preciousness, or cutesiness—not clutter, quantity, chaos, decoration, intensity, or visual excess. Pastel colors alone are not Saccharine unless they contribute to a clearly sugary, cloying, aggressively sweet, sentimental, or cutesy presentation."},{"code":"PFM0203","name":"Melancholic","primIds":["P02","P03"],"matrixVersion":"0.0.0.0","aiMeaning":"Sad, wistful, reflective, or touched by longing and loss; downcast expressions, solitude, rain, fading light, or emotional heaviness."},{"code":"PFM0204","name":"Charming","primIds":["P02","P04"],"matrixVersion":"0.0.0.0","aiMeaning":"Pleasantly attractive, likable, engaging, or delightful in a way that wins affection; inviting expressions, warmth, approachable elegance, or pleasing details."},{"code":"PFM0205","name":"Majestic","primIds":["P02","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Grand, dignified, regal, imposing, or awe-inspiring in scale, presence, or bearing; symmetry, noble posture, stately beauty, or impressive scenery."},{"code":"PFM0206","name":"Surreal","primIds":["P02","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Dreamlike, impossible, uncanny, or illogical in an altered reality; distorted scale, impossible spaces, or unexpected object combinations.\nGate: Unusual, cluttered, confusing, eccentric, or visually busy imagery is not Surreal by itself. Ordinary people, rooms, objects, poses, or combinations remain ordinary unless the image actually alters reality through impossible spatial relationships, impossible or transformed objects, distorted scale, dream-logic, physically impossible events, or a clearly uncanny break from normal reality. Do not infer “dreamlike,” “impossible,” or “distorted” merely because a scene is strange, disorganized, or difficult to interpret."},{"code":"PFM0207","name":"Irreverent","primIds":["P02","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Disrespectful, cheeky, mocking, or dismissive toward seriousness, convention, authority, or decorum; visual disrespect toward sacred, formal, or authoritative symbols."},{"code":"PFM0208","name":"Romance","primIds":["P02","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Affection, longing, intimacy, courtship, tenderness, or romantic attraction; couples, affectionate gestures, closeness, or romantic settings."},{"code":"PFM0209","name":"Exposure","primIds":["P02","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Being naked, indecently revealed, or too visibly exposed, especially in ways that feel shameful, embarrassing, humiliating, or sexually charged; visible nudity, uncovered body parts, flashing, revealing poses, or accidental bodily exposure."},{"code":"PFM0210","name":"Grotesque","primIds":["P02","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Whimsical or ornamental distortion mixing beauty, absurdity, or unease; hybrid human, animal, or plant forms, exaggerated features, decorative symmetry, or playful violations of natural law."},{"code":"PFM0211","name":"Vulnerable","primIds":["P02","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Exposed to harm, rejection, injury, loss, or emotional pain; defenseless posture, exposed emotion, isolation, or injury."},{"code":"PFM0212","name":"Elegant","primIds":["P02","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Graceful, refined, tasteful, polished, restrained, or well composed; sophisticated detail, balanced composition, graceful forms, or controlled styling."},{"code":"PFM0213","name":"Festive","primIds":["P02","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Marked by celebration, holidays, ceremonies, or special occasions; decorations, costumes, lights, ornaments, seasonal styling, or celebratory settings."},{"code":"PFM0214","name":"Pretentious","primIds":["P02","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Affected, self-important, showy, or overly cultured or significant; conspicuous status display and affected refinement."},{"code":"PFM0304","name":"Ironic","primIds":["P03","P04"],"matrixVersion":"0.0.0.0","aiMeaning":"Tragic or unfortunate situations made funny through unexpected contrast, reversal, or coincidence. Or happy situations ruined by an unexpected reversal."},{"code":"PFM0305","name":"Devastating","primIds":["P03","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Causing profound damage, loss, grief, shock, defeat, or emotional destruction; catastrophic ruin, collapse, severe aftermath, or overwhelming loss."},{"code":"PFM0306","name":"Nightmarish","primIds":["P03","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Resembling a nightmare; frightening, disturbing, unreal, oppressive, or horrifying, with dream logic, threatening distortions, darkness, or impossible danger."},{"code":"PFM0307","name":"Shame","primIds":["P03","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Painful self-conscious disgrace, embarrassment, exposure, or feeling unworthy, judged, or wanting to hide; averted gaze, covered face, hiding posture, blushing, shrinking, or visibly caught embarrassment."},{"code":"PFM0308","name":"Liminal","primIds":["P03","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"In-between, transitional, eerily suspended, or depopulated spaces that feel familiar yet uncanny; thresholds, corridors, waiting areas, empty commercial or institutional interiors, backrooms-like environments, or places that feel caught between use and abandonment.\nEvidence can include hallways, doorways, stairwells, lobbies, parking areas, empty stores, offices, schools, or rooms whose lighting, emptiness, repetition, silence, or spatial ambiguity create an uncanny “between states” feeling.\nGate: Solitude, clutter, quiet, calm, or an ordinary room is not Liminal by itself. One person alone is not enough. Clutter is not sparseness. Quiet is not uncanny stillness. The image must convey a genuine threshold, transitional, depopulated, suspended, or familiar-but-off atmosphere beyond simple emptiness or being alone."},{"code":"PFM0309","name":"Humiliation","primIds":["P03","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Demeaning, degrading, ridiculing, belittling, infantilizing, exposing, or stripping someone of dignity.\nEvidence can include degrading treatment, public ridicule, forced exposure, visible embarrassment or submission, insulting labels or messages, or costumes, tattoos, markings, symbols, or body presentation that clearly function to demean, belittle, infantilize, ridicule, embarrass, or strip the subject of dignity.\nGate: A costume, tattoo, marking, label, symbol, exposure, or unusual presentation is not Humiliation by itself. It must carry a clearly degrading, belittling, ridiculing, infantilizing, or dignity-reducing meaning in context."},{"code":"PFM0310","name":"Despair","primIds":["P03","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Hopelessness, anguish, defeat, or the sense that relief or improvement has disappeared; collapsed posture, ruin, isolation, or hopeless expressions."},{"code":"PFM0311","name":"Foreboding","primIds":["P03","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Uneasy expectation that danger, trouble, harm, or an unwanted event is approaching; ominous shadows, stormy skies, suspense, or approaching threat."},{"code":"PFM0312","name":"Poignant","primIds":["P03","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Emotionally affecting through tenderness, sadness, meaning, or reflection; fragile moments, remembrance, meaningful loss, or emotional stillness."},{"code":"PFM0313","name":"Bittersweet","primIds":["P03","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Pleasure and sadness experienced together; joyful imagery touched by loss, nostalgia, farewell, memory, or impermanence."},{"code":"PFM0314","name":"Dysphoria","primIds":["P03","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Distress, dissatisfaction, unease, or disconnection involving self, body, identity, mood, or circumstance; bodily discomfort, alienation, or self-disconnection."},{"code":"PFM0405","name":"Cringe","primIds":["P04","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Painful awkwardness or embarrassment that causes secondhand discomfort; social blunders, failed interactions, awkward expressions, or embarrassing poses."},{"code":"PFM0406","name":"Zany","primIds":["P04","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Eccentric, unconventional, comically strange, or offbeat; mismatched costumes, unusual poses, frantic antics, or energetic comic behavior.\nGate: Ordinary resting, reclining, standing, sitting, or incidental poses are not Zany merely because they look unusual in isolation. General clutter, mismatched household objects, or visual disorder are not “mismatched costumes.” Zany requires genuinely eccentric, deliberately unconventional, comically strange, offbeat, frantic, or energetically comic behavior, styling, or presentation."},{"code":"PFM0407","name":"Satirical","primIds":["P04","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Using humor, irony, exaggeration, or ridicule to expose or criticize faults, behavior, institutions, or ideas; visual mockery of politics, culture, or social conventions."},{"code":"PFM0408","name":"Absurd","primIds":["P04","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Illogical, ridiculous, contradictory, pointless, impossible, or incompatible with ordinary sense; nonsensical juxtapositions, impossible logic, or ridiculous contradictions."},{"code":"PFM0409","name":"Ribaldry","primIds":["P04","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Coarse, bawdy, or sexually suggestive humor; sexual jokes, innuendo, vulgar comedy, bawdy gestures, or suggestive comic situations."},{"code":"PFM0410","name":"Grossout","primIds":["P04","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Humor or spectacle built around filth, bodily functions, fluids, decay, gore, infestation, vermin, or revulsion; vomit, excrement, bodily fluids, gross material, bugs, rats, flies, or other unclean/vermin-associated creatures used to create grossness or disgust.\nBoundary: Bugs, rats, flies, or other creatures are not Grossout merely because they are present. They contribute when they function as evidence of filth, uncleanness, contamination, infestation, decay, or revulsion in context."},{"code":"PFM0411","name":"ComedyHorror","primIds":["P04","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Frightening or macabre material blended with humor, parody, absurdity, slapstick, jokes, or comic relief."},{"code":"PFM0412","name":"Witty","primIds":["P04","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Clever, quick, inventive, or skillful humor and insight; visual puns, layered references, wordplay, or ingenious humorous juxtapositions."},{"code":"PFM0413","name":"PartyTime","primIds":["P04","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Active social celebration centered on revelry, fun, gathering, or excitement; dancing, cheering, crowds, drinks, decorations, music, or confetti."},{"code":"PFM0414","name":"Trolling","primIds":["P04","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Provoking, baiting, mocking, annoying, or misleading others for amusement or reaction; antagonistic jokes, mocking memes, baiting signs, or provocative gestures."},{"code":"PFM0506","name":"Chaotic","primIds":["P05","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Disordered, unstable, crowded, conflicting, or lacking control or organization; scattered objects, unstable motion, visual overload, or competing elements."},{"code":"PFM0507","name":"Outrageous","primIds":["P05","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Shockingly excessive, bold, offensive, audacious, unconventional, or beyond restraint; extreme styling, taboo-breaking, flamboyance, or audacious behavior."},{"code":"PFM0508","name":"Epic","primIds":["P05","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Grand, heroic, or massive in scale, consequence, duration, drama, adventure, struggle, achievement, or spectacle; monumental scenery, heroic action, or high stakes."},{"code":"PFM0509","name":"Lust","primIds":["P05","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexual desire, appetite, craving, fixation, or physical attraction; desirous gazes, sensual bodies, erotic focus, or visible craving."},{"code":"PFM0510","name":"Brutal","primIds":["P05","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Harsh, violent, cruel, punishing, damaging, or unsparing in force or effect; severe injury, destruction, cruelty, or punishing conditions."},{"code":"PFM0511","name":"Terror","primIds":["P05","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Extreme fear, alarm, panic, dread, or immediate danger; terrified expressions, fleeing, overwhelming threat, or visible panic."},{"code":"PFM0512","name":"Brilliant","primIds":["P05","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Clever, inventive, insightful, creative, effective, or intellectually impressive; ingenious designs, exceptional craftsmanship, inventive solutions, or impressive execution."},{"code":"PFM0513","name":"Pride","primIds":["P05","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Satisfaction, self-respect, dignity, or affirmation tied to achievement, identity, belonging, or worth; gay or LGBT imagery; confident posture, identity symbols, or dignified self-presentation."},{"code":"PFM0514","name":"Aggressive","primIds":["P05","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Confrontational, forceful, hostile, threatening, domineering, or ready to attack; attack gestures, weapons, intimidation, forceful motion, or threatening posture."},{"code":"PFM0607","name":"Freakshow","primIds":["P06","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Bizarre, degrading, dysfunctional, shocking, or socially transgressive people, situations, lifestyles, or spectacles that provoke fascinated, guilty, voyeuristic, or trainwreck-like attention; something disturbing, embarrassing, abnormal, or shameful that is compelling to look at.\nEvidence can include unusual performers or exhibited subjects, carnival/sideshow-like presentation, gawking attention, conspicuous dysfunction, degrading living conditions, humiliating or bizarre personal presentation, shocking anomalies, or situations whose very wrongness or dysfunction makes them fascinating to observe.\nGate: Mere clutter, eccentricity, poverty, unusual appearance, or disorder is not Freakshow by itself. The scene must actually carry a sense of bizarre, degrading, dysfunctional, shocking, embarrassing, or transgressive spectacle that invites fascinated or trainwreck-like attention."},{"code":"PFM0608","name":"Psychedelic","primIds":["P06","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Hallucinatory, sensory-rich, perception-bending, or suggestive of expanded or distorted consciousness; vivid colors, swirling patterns, fractals, or hallucination-like effects."},{"code":"PFM0609","name":"FreakyDeaky","primIds":["P06","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexually playful, unconventional, eccentric, uninhibited, or erotic with an oddball edge; strange erotic styling, playful erotic imagery, or unconventional sexual presentation."},{"code":"PFM0610","name":"Mutant","primIds":["P06","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Biological form altered from a known prototype through mutation, radiation, chemicals, genetics, abnormal development, hybridization, or evolution; extra limbs, altered organs, abnormal growths, or techno-organic fusion."},{"code":"PFM0611","name":"Macabre","primIds":["P06","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Gothic morbidity centered on death, corpses, decay, mortality, funerary imagery, or morbid fascination; skulls, graves, death rituals, or ornate morbid decoration."},{"code":"PFM0612","name":"Alien","primIds":["P06","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Strange, foreign, unfamiliar, or nonhuman; suggesting intelligence, biology, places, or forms outside ordinary human experience. Unfamiliar beings, strange anatomy, spacecraft, foreign environments, otherworldly landscapes, or unfamiliar technology."},{"code":"PFM0613","name":"Delirious","primIds":["P06","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Disoriented, feverish, ecstatic, manic, confused, or detached from stable reality; hallucinations, unstable visual reality, feverish expressions, or ecstatic chaos."},{"code":"PFM0614","name":"Monstrous","primIds":["P06","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Awe-inspiring unnatural threat defined by immense scale, predation, mythic power, or eldritch otherness; colossal creatures, chimeric anatomy, predatory weapons, and impossible features."},{"code":"PFM0708","name":"Medicated","primIds":["P07","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Altered, softened, detached, or chemically influenced consciousness or perception; drowsy eyes, softened expressions, detached gaze, pills, or clinical sedation cues."},{"code":"PFM0709","name":"Exploitation","primIds":["P07","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Using people, bodies, suffering, taboo, shock, or sensational material for advantage, attention, profit, or gratification; objectification, commodification, or spectacle built from others."},{"code":"PFM0710","name":"Tasteless","primIds":["P07","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Vulgar, crude, offensive, insensitive, indecent, or lacking judgment or restraint; socially or aesthetically offensive imagery or insensitive presentation."},{"code":"PFM0711","name":"Execrable","primIds":["P07","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Hateful, detestable, contemptible, vile, cruel, or deserving condemnation; deliberately abhorrent content or visible malice."},{"code":"PFM0712","name":"Parodic","primIds":["P07","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Imitating a recognizable style, work, person, or convention through exaggeration, distortion, mockery, or comic transformation.\nBoundary: Clutter, mess, or an exaggerated-looking scene is not Parodic by itself. The evidence must identify a recognizable style, work, person, convention, archetype, or trope and show how the image imitates, exaggerates, distorts, mocks, or comically transforms it."},{"code":"PFM0713","name":"Snarky","primIds":["P07","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Sarcastic, cutting, mocking, dismissive, or contemptuous humor; eye-rolls, smirks, mocking gestures, sarcastic captions, or dismissive commentary.\nGate: General humor, silliness, playfulness, costumes, joking, lighthearted behavior, or funny-looking situations are not Snarky by themselves. Snarky requires a specifically sarcastic, cutting, mocking, dismissive, or contemptuous quality—such as a sarcastic remark or caption, mocking imitation, derisive expression or gesture, eye-roll, smirk, or humor clearly directed at belittling or dismissing a person, idea, behavior, or situation."},{"code":"PFM0714","name":"Wickedness","primIds":["P07","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Wrongdoing, cruelty, malice, corruption, immorality, or pleasure in harmful behavior; deliberate harm, malicious intent, corruption, or gleeful wrongdoing."},{"code":"PFM0809","name":"Limerence","primIds":["P08","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Romantic infatuation marked by longing, idealization, uncertainty, fantasy, or desire for reciprocation; idealized crush imagery, fixation, longing gazes, or unreciprocated yearning.\nGate: Longing, staring, daydreaming, sadness, solitude, fixation, lying in bed, or an upward/distant gaze is not Limerence by itself. There must be clear evidence that the longing, fantasy, fixation, idealization, uncertainty, or desire for reciprocation is specifically romantic and directed toward another person or romantic attachment. Do not infer romantic infatuation from posture, gaze direction, mood, clutter, or isolation alone."},{"code":"PFM0810","name":"Putrid","primIds":["P08","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Rotten, decaying, foul, contaminated, corrupt, or unpleasant; decomposition, mold, slime, spoiled matter, or contamination."},{"code":"PFM0811","name":"Eerie","primIds":["P08","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Unsettling, haunting, uncanny, quiet, mysterious, or suggestive that something is wrong; strange shadows, emptiness, haunting stillness, or subtle wrongness."},{"code":"PFM0812","name":"Ethereal","primIds":["P08","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Airy, delicate, luminous, weightless, otherworldly, or removed from ordinary physical substance; soft glow, translucence, mist, or delicate forms."},{"code":"PFM0813","name":"Magical","primIds":["P08","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Enchanting, supernatural, wondrous, impossible, or governed by forces from a different reality; spells, glowing effects, impossible transformations, enchanted beings, or supernatural phenomena."},{"code":"PFM0814","name":"Phantasmagoric","primIds":["P08","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Elaborate grotesque fantasy with bizarre creatures, impossible forms, or disturbing imagery."},{"code":"PFM0910","name":"Lewd","primIds":["P09","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexually explicit, vulgar, indecent, crude, suggestive, or offensively erotic; explicit exposure, crude sexual gestures, vulgar erotic jokes, or indecent posing."},{"code":"PFM0911","name":"Seduction","primIds":["P09","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Attraction created through allure, temptation, mystery, danger, or sexual invitation; alluring poses, intimate gaze, revealing styling, or a dangerous sensual atmosphere."},{"code":"PFM0912","name":"Kinky","primIds":["P09","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexually unconventional, fetish-oriented, experimental, role-based, or involving nonstandard preferences or practices; fetish attire, bondage cues, role-play, or unconventional erotic props."},{"code":"PFM0913","name":"Hedonism","primIds":["P09","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Pleasure, gratification, sensual enjoyment, luxury, appetite, or indulgence elevated into an atmosphere or lifestyle; feasting, partying, lavish consumption, sensual abundance, or decadent excess."},{"code":"PFM0914","name":"Sadomasochism","primIds":["P09","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Erotic pleasure involving pain, domination, submission, humiliation, control, or suffering; bondage, power exchange, or controlled physical pain."},{"code":"PFM1011","name":"Horror","primIds":["P10","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Fear, dread, shock, or revulsion produced by disturbing, threatening, grotesque, supernatural, or violent material; monsters, gore, frightening scenes, or supernatural danger.\nGate: Clutter, disorder, neglect, darkness, an ordinary room, a person lying still, or an inactive television is not Horror by itself. Horror requires actual evidence of fear, dread, shock, or revulsion arising from disturbing, threatening, grotesque, supernatural, violent, or clearly ominous material. Do not infer frightening scenes, supernatural danger, violence, or threat from ordinary objects or ambiguous surroundings without concrete supporting evidence."},{"code":"PFM1012","name":"Greed","primIds":["P10","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Excessive desire to possess, acquire, keep, or control wealth, resources, status, power, or advantage; hoarding, grabbing valuables, status fixation, or acquisitiveness."},{"code":"PFM1013","name":"Indulgent","primIds":["P10","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Permissive toward pleasure, appetite, comfort, luxury, excess, or personal gratification; rich food, lounging, pampering, luxury, or overconsumption."},{"code":"PFM1014","name":"Repulsive","primIds":["P10","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Immediate visceral disgust caused by decay, contamination, bodily fluids, wounds, infection, or organic breakdown; rotting flesh, pus, vomit, lesions, parasites, or formless slime."},{"code":"PFM1112","name":"Paranoia","primIds":["P11","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Persistent suspicion or fear of harm, deception, surveillance, persecution, or hidden threat; watchful fear, suspicious glances, defensive behavior, or surveillance imagery."},{"code":"PFM1113","name":"Spirituality","primIds":["P11","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Meaning, transcendence, sacredness, inner life, faith, ritual, or connection beyond ordinary material existence; prayer, meditation, worship, sacred symbols, or mystical connection."},{"code":"PFM1114","name":"Violated","primIds":["P11","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"A boundary, body, trust, right, safety, privacy, or autonomy invaded or broken; forced intrusion, damaged privacy, assault aftermath, or breached safety."},{"code":"PFM1213","name":"Glory","primIds":["P12","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Honor, acclaim, valor, prestige, or celebrated achievement; trophies, medals, military honors, victory displays, heroic poses, or public recognition."},{"code":"PFM1214","name":"Obsessive","primIds":["P12","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Fixated, compulsive, preoccupied, repetitive, or unable to release attention from a person, idea, goal, or concern; repeated patterns, hoarding, compulsive arrangement, or relentless focus.\nGate: Ordinary clutter, mess, or casual attention is not Obsessive by itself. A still image can support Obsessive when it visibly shows the accumulated effects of persistent fixation, compulsion, or inability to let go—such as hoarding, excessive accumulation, overwhelming possession density, repeated buildup, ritualized arrangement, or an environment substantially dominated by a person’s preoccupation. Do not invent an unrelated fixation when the visible evidence supports a different obsessive route."},{"code":"PFM1314","name":"Revenge","primIds":["P13","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Retaliation, payback, punishment, or action answering a perceived wrong or injury; retaliatory acts, targeting offenders, punishment, or settling scores."}],"themeChoices":[{"code":"P01","name":"Adorable","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P02","name":"Beautiful","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P03","name":"Tragic","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P04","name":"Funny","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P05","name":"Intense","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P06","name":"Weird","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P07","name":"Ticket","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P08","name":"Dreamy","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P09","name":"Zazzly","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P10","name":"Disgusting","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P11","name":"Scary","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P12","name":"Smart","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P13","name":"Celebration","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"P14","name":"Angry","kind":"prim","matrixVersion":"0.0.0.0"},{"code":"PFM0102","name":"Cozy","kind":"fusion","primIds":["P01","P02"],"matrixVersion":"0.0.0.0","aiMeaning":"Comforting, snug, warm, sheltered, or inviting; soft textures, warm lighting, blankets, relaxed intimate settings, or a feeling of ease, rest, or pleasant closeness."},{"code":"PFM0103","name":"Pitiful","kind":"fusion","primIds":["P01","P03"],"matrixVersion":"0.0.0.0","aiMeaning":"Arousing sympathy or compassion through visible helplessness, suffering, misfortune, weakness, neglect, injury, abandonment, or pleading."},{"code":"PFM0104","name":"Goofy","kind":"fusion","primIds":["P01","P04"],"matrixVersion":"0.0.0.0","aiMeaning":"Silly, awkward, playful, foolish, or ridiculous in an amusing way; exaggerated expressions, clumsy antics, or playful visual absurdity.\nGate: Ordinary resting, reclining, standing, sitting, relaxation, incidental awkwardness, clutter, or an unusual-looking scene is not Goofy by itself. Goofy requires actual amusing silliness, foolishness, clumsy antics, playful absurdity, exaggerated comic behavior or expression, or comparable laughter-producing incongruity. Do not infer playfulness merely from relaxation, mess, or an ordinary pose."},{"code":"PFM0105","name":"Joy","kind":"fusion","primIds":["P01","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Happiness, delight, pleasure, or emotional uplift shown through smiling, laughter, delighted expressions, playful pleasure, or visible enjoyment."},{"code":"PFM0106","name":"Bizarre","kind":"fusion","primIds":["P01","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Strange, unusual, unexpected, peculiar; improbable combinations, anomalous forms, or unexplained oddities."},{"code":"PFM0107","name":"Camp","kind":"fusion","primIds":["P01","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Exaggerated, theatrical, artificial, flamboyant, kitschy, or knowingly excessive styling and presentation."},{"code":"PFM0108","name":"Whimsical","kind":"fusion","primIds":["P01","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Fanciful, playful, imaginative, lightly odd, or guided by charming logic; fantasy details, charming oddities, or impossible elements."},{"code":"PFM0109","name":"Kawaii","kind":"fusion","primIds":["P01","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Highly stylized Japanese cute aesthetic using exaggerated sweetness or toy-like, childlike, or chibi-style proportions."},{"code":"PFM0110","name":"UglyCute","kind":"fusion","primIds":["P01","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"“So ugly it’s cute” appeal: unattractive, awkward, scruffy, misshapen, grotesque, gross-looking, or otherwise visually off-putting qualities that become endearing, charming, funny, lovable, or cute; the ugliness or ickiness is itself part of the appeal.\nEvidence can include troll-like dolls, scruffy animals, odd little creatures, misshapen toys, awkward faces or proportions, strange character designs, or other subjects whose off-putting features actively increase their endearment.\nGate: Dirt, grime, filth, clutter, ugliness, disgust, or cuteness alone is not UglyCute. The image must combine genuine off-putting, ugly, or icky qualities with genuine cute or endearing appeal, and the undesirable quality must contribute to the affection rather than merely coexist with it."},{"code":"PFM0111","name":"CreepyCute","kind":"fusion","primIds":["P01","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Cute and unsettling at once; Halloween fun. Appealing subjects combined with eerie, spooky, uncanny, or disturbing features."},{"code":"PFM0112","name":"Innocence","kind":"fusion","primIds":["P01","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Openness, inexperience, trust, simplicity, or freedom from corruption; childlike expressions, gentleness, or naive imagery."},{"code":"PFM0113","name":"Playful","kind":"fusion","primIds":["P01","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Lighthearted, mischievous, teasing, game-like, curious, imaginative, or inclined toward fun and experimentation; playful role-taking, dress-up, character customization, make-believe, games, toys, teasing gestures, spontaneous fun, or deliberately fun self-presentation.\nClarification: Playful does not require laughter, toys, overt antics, or childish behavior. Role-play, dress-up, character experimentation, and deliberately fun or lighthearted presentation can independently support Playful when they function as play."},{"code":"PFM0114","name":"Saccharine","kind":"fusion","primIds":["P01","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Excessively sweet, sentimental, precious, or cutesy to the point of irritation; sugary, pastel, cloying, aggressively sweet imagery.\nGate: “Excessive” means excessive sweetness, sentimentality, preciousness, or cutesiness—not clutter, quantity, chaos, decoration, intensity, or visual excess. Pastel colors alone are not Saccharine unless they contribute to a clearly sugary, cloying, aggressively sweet, sentimental, or cutesy presentation."},{"code":"PFM0203","name":"Melancholic","kind":"fusion","primIds":["P02","P03"],"matrixVersion":"0.0.0.0","aiMeaning":"Sad, wistful, reflective, or touched by longing and loss; downcast expressions, solitude, rain, fading light, or emotional heaviness."},{"code":"PFM0204","name":"Charming","kind":"fusion","primIds":["P02","P04"],"matrixVersion":"0.0.0.0","aiMeaning":"Pleasantly attractive, likable, engaging, or delightful in a way that wins affection; inviting expressions, warmth, approachable elegance, or pleasing details."},{"code":"PFM0205","name":"Majestic","kind":"fusion","primIds":["P02","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Grand, dignified, regal, imposing, or awe-inspiring in scale, presence, or bearing; symmetry, noble posture, stately beauty, or impressive scenery."},{"code":"PFM0206","name":"Surreal","kind":"fusion","primIds":["P02","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Dreamlike, impossible, uncanny, or illogical in an altered reality; distorted scale, impossible spaces, or unexpected object combinations.\nGate: Unusual, cluttered, confusing, eccentric, or visually busy imagery is not Surreal by itself. Ordinary people, rooms, objects, poses, or combinations remain ordinary unless the image actually alters reality through impossible spatial relationships, impossible or transformed objects, distorted scale, dream-logic, physically impossible events, or a clearly uncanny break from normal reality. Do not infer “dreamlike,” “impossible,” or “distorted” merely because a scene is strange, disorganized, or difficult to interpret."},{"code":"PFM0207","name":"Irreverent","kind":"fusion","primIds":["P02","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Disrespectful, cheeky, mocking, or dismissive toward seriousness, convention, authority, or decorum; visual disrespect toward sacred, formal, or authoritative symbols."},{"code":"PFM0208","name":"Romance","kind":"fusion","primIds":["P02","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Affection, longing, intimacy, courtship, tenderness, or romantic attraction; couples, affectionate gestures, closeness, or romantic settings."},{"code":"PFM0209","name":"Exposure","kind":"fusion","primIds":["P02","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Being naked, indecently revealed, or too visibly exposed, especially in ways that feel shameful, embarrassing, humiliating, or sexually charged; visible nudity, uncovered body parts, flashing, revealing poses, or accidental bodily exposure."},{"code":"PFM0210","name":"Grotesque","kind":"fusion","primIds":["P02","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Whimsical or ornamental distortion mixing beauty, absurdity, or unease; hybrid human, animal, or plant forms, exaggerated features, decorative symmetry, or playful violations of natural law."},{"code":"PFM0211","name":"Vulnerable","kind":"fusion","primIds":["P02","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Exposed to harm, rejection, injury, loss, or emotional pain; defenseless posture, exposed emotion, isolation, or injury."},{"code":"PFM0212","name":"Elegant","kind":"fusion","primIds":["P02","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Graceful, refined, tasteful, polished, restrained, or well composed; sophisticated detail, balanced composition, graceful forms, or controlled styling."},{"code":"PFM0213","name":"Festive","kind":"fusion","primIds":["P02","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Marked by celebration, holidays, ceremonies, or special occasions; decorations, costumes, lights, ornaments, seasonal styling, or celebratory settings."},{"code":"PFM0214","name":"Pretentious","kind":"fusion","primIds":["P02","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Affected, self-important, showy, or overly cultured or significant; conspicuous status display and affected refinement."},{"code":"PFM0304","name":"Ironic","kind":"fusion","primIds":["P03","P04"],"matrixVersion":"0.0.0.0","aiMeaning":"Tragic or unfortunate situations made funny through unexpected contrast, reversal, or coincidence. Or happy situations ruined by an unexpected reversal."},{"code":"PFM0305","name":"Devastating","kind":"fusion","primIds":["P03","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Causing profound damage, loss, grief, shock, defeat, or emotional destruction; catastrophic ruin, collapse, severe aftermath, or overwhelming loss."},{"code":"PFM0306","name":"Nightmarish","kind":"fusion","primIds":["P03","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Resembling a nightmare; frightening, disturbing, unreal, oppressive, or horrifying, with dream logic, threatening distortions, darkness, or impossible danger."},{"code":"PFM0307","name":"Shame","kind":"fusion","primIds":["P03","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Painful self-conscious disgrace, embarrassment, exposure, or feeling unworthy, judged, or wanting to hide; averted gaze, covered face, hiding posture, blushing, shrinking, or visibly caught embarrassment."},{"code":"PFM0308","name":"Liminal","kind":"fusion","primIds":["P03","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"In-between, transitional, eerily suspended, or depopulated spaces that feel familiar yet uncanny; thresholds, corridors, waiting areas, empty commercial or institutional interiors, backrooms-like environments, or places that feel caught between use and abandonment.\nEvidence can include hallways, doorways, stairwells, lobbies, parking areas, empty stores, offices, schools, or rooms whose lighting, emptiness, repetition, silence, or spatial ambiguity create an uncanny “between states” feeling.\nGate: Solitude, clutter, quiet, calm, or an ordinary room is not Liminal by itself. One person alone is not enough. Clutter is not sparseness. Quiet is not uncanny stillness. The image must convey a genuine threshold, transitional, depopulated, suspended, or familiar-but-off atmosphere beyond simple emptiness or being alone."},{"code":"PFM0309","name":"Humiliation","kind":"fusion","primIds":["P03","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Demeaning, degrading, ridiculing, belittling, infantilizing, exposing, or stripping someone of dignity.\nEvidence can include degrading treatment, public ridicule, forced exposure, visible embarrassment or submission, insulting labels or messages, or costumes, tattoos, markings, symbols, or body presentation that clearly function to demean, belittle, infantilize, ridicule, embarrass, or strip the subject of dignity.\nGate: A costume, tattoo, marking, label, symbol, exposure, or unusual presentation is not Humiliation by itself. It must carry a clearly degrading, belittling, ridiculing, infantilizing, or dignity-reducing meaning in context."},{"code":"PFM0310","name":"Despair","kind":"fusion","primIds":["P03","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Hopelessness, anguish, defeat, or the sense that relief or improvement has disappeared; collapsed posture, ruin, isolation, or hopeless expressions."},{"code":"PFM0311","name":"Foreboding","kind":"fusion","primIds":["P03","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Uneasy expectation that danger, trouble, harm, or an unwanted event is approaching; ominous shadows, stormy skies, suspense, or approaching threat."},{"code":"PFM0312","name":"Poignant","kind":"fusion","primIds":["P03","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Emotionally affecting through tenderness, sadness, meaning, or reflection; fragile moments, remembrance, meaningful loss, or emotional stillness."},{"code":"PFM0313","name":"Bittersweet","kind":"fusion","primIds":["P03","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Pleasure and sadness experienced together; joyful imagery touched by loss, nostalgia, farewell, memory, or impermanence."},{"code":"PFM0314","name":"Dysphoria","kind":"fusion","primIds":["P03","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Distress, dissatisfaction, unease, or disconnection involving self, body, identity, mood, or circumstance; bodily discomfort, alienation, or self-disconnection."},{"code":"PFM0405","name":"Cringe","kind":"fusion","primIds":["P04","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Painful awkwardness or embarrassment that causes secondhand discomfort; social blunders, failed interactions, awkward expressions, or embarrassing poses."},{"code":"PFM0406","name":"Zany","kind":"fusion","primIds":["P04","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Eccentric, unconventional, comically strange, or offbeat; mismatched costumes, unusual poses, frantic antics, or energetic comic behavior.\nGate: Ordinary resting, reclining, standing, sitting, or incidental poses are not Zany merely because they look unusual in isolation. General clutter, mismatched household objects, or visual disorder are not “mismatched costumes.” Zany requires genuinely eccentric, deliberately unconventional, comically strange, offbeat, frantic, or energetically comic behavior, styling, or presentation."},{"code":"PFM0407","name":"Satirical","kind":"fusion","primIds":["P04","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Using humor, irony, exaggeration, or ridicule to expose or criticize faults, behavior, institutions, or ideas; visual mockery of politics, culture, or social conventions."},{"code":"PFM0408","name":"Absurd","kind":"fusion","primIds":["P04","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Illogical, ridiculous, contradictory, pointless, impossible, or incompatible with ordinary sense; nonsensical juxtapositions, impossible logic, or ridiculous contradictions."},{"code":"PFM0409","name":"Ribaldry","kind":"fusion","primIds":["P04","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Coarse, bawdy, or sexually suggestive humor; sexual jokes, innuendo, vulgar comedy, bawdy gestures, or suggestive comic situations."},{"code":"PFM0410","name":"Grossout","kind":"fusion","primIds":["P04","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Humor or spectacle built around filth, bodily functions, fluids, decay, gore, infestation, vermin, or revulsion; vomit, excrement, bodily fluids, gross material, bugs, rats, flies, or other unclean/vermin-associated creatures used to create grossness or disgust.\nBoundary: Bugs, rats, flies, or other creatures are not Grossout merely because they are present. They contribute when they function as evidence of filth, uncleanness, contamination, infestation, decay, or revulsion in context."},{"code":"PFM0411","name":"ComedyHorror","kind":"fusion","primIds":["P04","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Frightening or macabre material blended with humor, parody, absurdity, slapstick, jokes, or comic relief."},{"code":"PFM0412","name":"Witty","kind":"fusion","primIds":["P04","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Clever, quick, inventive, or skillful humor and insight; visual puns, layered references, wordplay, or ingenious humorous juxtapositions."},{"code":"PFM0413","name":"PartyTime","kind":"fusion","primIds":["P04","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Active social celebration centered on revelry, fun, gathering, or excitement; dancing, cheering, crowds, drinks, decorations, music, or confetti."},{"code":"PFM0414","name":"Trolling","kind":"fusion","primIds":["P04","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Provoking, baiting, mocking, annoying, or misleading others for amusement or reaction; antagonistic jokes, mocking memes, baiting signs, or provocative gestures."},{"code":"PFM0506","name":"Chaotic","kind":"fusion","primIds":["P05","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Disordered, unstable, crowded, conflicting, or lacking control or organization; scattered objects, unstable motion, visual overload, or competing elements."},{"code":"PFM0507","name":"Outrageous","kind":"fusion","primIds":["P05","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Shockingly excessive, bold, offensive, audacious, unconventional, or beyond restraint; extreme styling, taboo-breaking, flamboyance, or audacious behavior."},{"code":"PFM0508","name":"Epic","kind":"fusion","primIds":["P05","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Grand, heroic, or massive in scale, consequence, duration, drama, adventure, struggle, achievement, or spectacle; monumental scenery, heroic action, or high stakes."},{"code":"PFM0509","name":"Lust","kind":"fusion","primIds":["P05","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexual desire, appetite, craving, fixation, or physical attraction; desirous gazes, sensual bodies, erotic focus, or visible craving."},{"code":"PFM0510","name":"Brutal","kind":"fusion","primIds":["P05","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Harsh, violent, cruel, punishing, damaging, or unsparing in force or effect; severe injury, destruction, cruelty, or punishing conditions."},{"code":"PFM0511","name":"Terror","kind":"fusion","primIds":["P05","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Extreme fear, alarm, panic, dread, or immediate danger; terrified expressions, fleeing, overwhelming threat, or visible panic."},{"code":"PFM0512","name":"Brilliant","kind":"fusion","primIds":["P05","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Clever, inventive, insightful, creative, effective, or intellectually impressive; ingenious designs, exceptional craftsmanship, inventive solutions, or impressive execution."},{"code":"PFM0513","name":"Pride","kind":"fusion","primIds":["P05","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Satisfaction, self-respect, dignity, or affirmation tied to achievement, identity, belonging, or worth; gay or LGBT imagery; confident posture, identity symbols, or dignified self-presentation."},{"code":"PFM0514","name":"Aggressive","kind":"fusion","primIds":["P05","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Confrontational, forceful, hostile, threatening, domineering, or ready to attack; attack gestures, weapons, intimidation, forceful motion, or threatening posture."},{"code":"PFM0607","name":"Freakshow","kind":"fusion","primIds":["P06","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Bizarre, degrading, dysfunctional, shocking, or socially transgressive people, situations, lifestyles, or spectacles that provoke fascinated, guilty, voyeuristic, or trainwreck-like attention; something disturbing, embarrassing, abnormal, or shameful that is compelling to look at.\nEvidence can include unusual performers or exhibited subjects, carnival/sideshow-like presentation, gawking attention, conspicuous dysfunction, degrading living conditions, humiliating or bizarre personal presentation, shocking anomalies, or situations whose very wrongness or dysfunction makes them fascinating to observe.\nGate: Mere clutter, eccentricity, poverty, unusual appearance, or disorder is not Freakshow by itself. The scene must actually carry a sense of bizarre, degrading, dysfunctional, shocking, embarrassing, or transgressive spectacle that invites fascinated or trainwreck-like attention."},{"code":"PFM0608","name":"Psychedelic","kind":"fusion","primIds":["P06","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Hallucinatory, sensory-rich, perception-bending, or suggestive of expanded or distorted consciousness; vivid colors, swirling patterns, fractals, or hallucination-like effects."},{"code":"PFM0609","name":"FreakyDeaky","kind":"fusion","primIds":["P06","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexually playful, unconventional, eccentric, uninhibited, or erotic with an oddball edge; strange erotic styling, playful erotic imagery, or unconventional sexual presentation."},{"code":"PFM0610","name":"Mutant","kind":"fusion","primIds":["P06","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Biological form altered from a known prototype through mutation, radiation, chemicals, genetics, abnormal development, hybridization, or evolution; extra limbs, altered organs, abnormal growths, or techno-organic fusion."},{"code":"PFM0611","name":"Macabre","kind":"fusion","primIds":["P06","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Gothic morbidity centered on death, corpses, decay, mortality, funerary imagery, or morbid fascination; skulls, graves, death rituals, or ornate morbid decoration."},{"code":"PFM0612","name":"Alien","kind":"fusion","primIds":["P06","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Strange, foreign, unfamiliar, or nonhuman; suggesting intelligence, biology, places, or forms outside ordinary human experience. Unfamiliar beings, strange anatomy, spacecraft, foreign environments, otherworldly landscapes, or unfamiliar technology."},{"code":"PFM0613","name":"Delirious","kind":"fusion","primIds":["P06","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Disoriented, feverish, ecstatic, manic, confused, or detached from stable reality; hallucinations, unstable visual reality, feverish expressions, or ecstatic chaos."},{"code":"PFM0614","name":"Monstrous","kind":"fusion","primIds":["P06","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Awe-inspiring unnatural threat defined by immense scale, predation, mythic power, or eldritch otherness; colossal creatures, chimeric anatomy, predatory weapons, and impossible features."},{"code":"PFM0708","name":"Medicated","kind":"fusion","primIds":["P07","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Altered, softened, detached, or chemically influenced consciousness or perception; drowsy eyes, softened expressions, detached gaze, pills, or clinical sedation cues."},{"code":"PFM0709","name":"Exploitation","kind":"fusion","primIds":["P07","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Using people, bodies, suffering, taboo, shock, or sensational material for advantage, attention, profit, or gratification; objectification, commodification, or spectacle built from others."},{"code":"PFM0710","name":"Tasteless","kind":"fusion","primIds":["P07","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Vulgar, crude, offensive, insensitive, indecent, or lacking judgment or restraint; socially or aesthetically offensive imagery or insensitive presentation."},{"code":"PFM0711","name":"Execrable","kind":"fusion","primIds":["P07","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Hateful, detestable, contemptible, vile, cruel, or deserving condemnation; deliberately abhorrent content or visible malice."},{"code":"PFM0712","name":"Parodic","kind":"fusion","primIds":["P07","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Imitating a recognizable style, work, person, or convention through exaggeration, distortion, mockery, or comic transformation.\nBoundary: Clutter, mess, or an exaggerated-looking scene is not Parodic by itself. The evidence must identify a recognizable style, work, person, convention, archetype, or trope and show how the image imitates, exaggerates, distorts, mocks, or comically transforms it."},{"code":"PFM0713","name":"Snarky","kind":"fusion","primIds":["P07","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Sarcastic, cutting, mocking, dismissive, or contemptuous humor; eye-rolls, smirks, mocking gestures, sarcastic captions, or dismissive commentary.\nGate: General humor, silliness, playfulness, costumes, joking, lighthearted behavior, or funny-looking situations are not Snarky by themselves. Snarky requires a specifically sarcastic, cutting, mocking, dismissive, or contemptuous quality—such as a sarcastic remark or caption, mocking imitation, derisive expression or gesture, eye-roll, smirk, or humor clearly directed at belittling or dismissing a person, idea, behavior, or situation."},{"code":"PFM0714","name":"Wickedness","kind":"fusion","primIds":["P07","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Wrongdoing, cruelty, malice, corruption, immorality, or pleasure in harmful behavior; deliberate harm, malicious intent, corruption, or gleeful wrongdoing."},{"code":"PFM0809","name":"Limerence","kind":"fusion","primIds":["P08","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Romantic infatuation marked by longing, idealization, uncertainty, fantasy, or desire for reciprocation; idealized crush imagery, fixation, longing gazes, or unreciprocated yearning.\nGate: Longing, staring, daydreaming, sadness, solitude, fixation, lying in bed, or an upward/distant gaze is not Limerence by itself. There must be clear evidence that the longing, fantasy, fixation, idealization, uncertainty, or desire for reciprocation is specifically romantic and directed toward another person or romantic attachment. Do not infer romantic infatuation from posture, gaze direction, mood, clutter, or isolation alone."},{"code":"PFM0810","name":"Putrid","kind":"fusion","primIds":["P08","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Rotten, decaying, foul, contaminated, corrupt, or unpleasant; decomposition, mold, slime, spoiled matter, or contamination."},{"code":"PFM0811","name":"Eerie","kind":"fusion","primIds":["P08","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Unsettling, haunting, uncanny, quiet, mysterious, or suggestive that something is wrong; strange shadows, emptiness, haunting stillness, or subtle wrongness."},{"code":"PFM0812","name":"Ethereal","kind":"fusion","primIds":["P08","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Airy, delicate, luminous, weightless, otherworldly, or removed from ordinary physical substance; soft glow, translucence, mist, or delicate forms."},{"code":"PFM0813","name":"Magical","kind":"fusion","primIds":["P08","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Enchanting, supernatural, wondrous, impossible, or governed by forces from a different reality; spells, glowing effects, impossible transformations, enchanted beings, or supernatural phenomena."},{"code":"PFM0814","name":"Phantasmagoric","kind":"fusion","primIds":["P08","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Elaborate grotesque fantasy with bizarre creatures, impossible forms, or disturbing imagery."},{"code":"PFM0910","name":"Lewd","kind":"fusion","primIds":["P09","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexually explicit, vulgar, indecent, crude, suggestive, or offensively erotic; explicit exposure, crude sexual gestures, vulgar erotic jokes, or indecent posing."},{"code":"PFM0911","name":"Seduction","kind":"fusion","primIds":["P09","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Attraction created through allure, temptation, mystery, danger, or sexual invitation; alluring poses, intimate gaze, revealing styling, or a dangerous sensual atmosphere."},{"code":"PFM0912","name":"Kinky","kind":"fusion","primIds":["P09","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexually unconventional, fetish-oriented, experimental, role-based, or involving nonstandard preferences or practices; fetish attire, bondage cues, role-play, or unconventional erotic props."},{"code":"PFM0913","name":"Hedonism","kind":"fusion","primIds":["P09","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Pleasure, gratification, sensual enjoyment, luxury, appetite, or indulgence elevated into an atmosphere or lifestyle; feasting, partying, lavish consumption, sensual abundance, or decadent excess."},{"code":"PFM0914","name":"Sadomasochism","kind":"fusion","primIds":["P09","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Erotic pleasure involving pain, domination, submission, humiliation, control, or suffering; bondage, power exchange, or controlled physical pain."},{"code":"PFM1011","name":"Horror","kind":"fusion","primIds":["P10","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Fear, dread, shock, or revulsion produced by disturbing, threatening, grotesque, supernatural, or violent material; monsters, gore, frightening scenes, or supernatural danger.\nGate: Clutter, disorder, neglect, darkness, an ordinary room, a person lying still, or an inactive television is not Horror by itself. Horror requires actual evidence of fear, dread, shock, or revulsion arising from disturbing, threatening, grotesque, supernatural, violent, or clearly ominous material. Do not infer frightening scenes, supernatural danger, violence, or threat from ordinary objects or ambiguous surroundings without concrete supporting evidence."},{"code":"PFM1012","name":"Greed","kind":"fusion","primIds":["P10","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Excessive desire to possess, acquire, keep, or control wealth, resources, status, power, or advantage; hoarding, grabbing valuables, status fixation, or acquisitiveness."},{"code":"PFM1013","name":"Indulgent","kind":"fusion","primIds":["P10","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Permissive toward pleasure, appetite, comfort, luxury, excess, or personal gratification; rich food, lounging, pampering, luxury, or overconsumption."},{"code":"PFM1014","name":"Repulsive","kind":"fusion","primIds":["P10","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Immediate visceral disgust caused by decay, contamination, bodily fluids, wounds, infection, or organic breakdown; rotting flesh, pus, vomit, lesions, parasites, or formless slime."},{"code":"PFM1112","name":"Paranoia","kind":"fusion","primIds":["P11","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Persistent suspicion or fear of harm, deception, surveillance, persecution, or hidden threat; watchful fear, suspicious glances, defensive behavior, or surveillance imagery."},{"code":"PFM1113","name":"Spirituality","kind":"fusion","primIds":["P11","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Meaning, transcendence, sacredness, inner life, faith, ritual, or connection beyond ordinary material existence; prayer, meditation, worship, sacred symbols, or mystical connection."},{"code":"PFM1114","name":"Violated","kind":"fusion","primIds":["P11","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"A boundary, body, trust, right, safety, privacy, or autonomy invaded or broken; forced intrusion, damaged privacy, assault aftermath, or breached safety."},{"code":"PFM1213","name":"Glory","kind":"fusion","primIds":["P12","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Honor, acclaim, valor, prestige, or celebrated achievement; trophies, medals, military honors, victory displays, heroic poses, or public recognition."},{"code":"PFM1214","name":"Obsessive","kind":"fusion","primIds":["P12","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Fixated, compulsive, preoccupied, repetitive, or unable to release attention from a person, idea, goal, or concern; repeated patterns, hoarding, compulsive arrangement, or relentless focus.\nGate: Ordinary clutter, mess, or casual attention is not Obsessive by itself. A still image can support Obsessive when it visibly shows the accumulated effects of persistent fixation, compulsion, or inability to let go—such as hoarding, excessive accumulation, overwhelming possession density, repeated buildup, ritualized arrangement, or an environment substantially dominated by a person’s preoccupation. Do not invent an unrelated fixation when the visible evidence supports a different obsessive route."},{"code":"PFM1314","name":"Revenge","kind":"fusion","primIds":["P13","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Retaliation, payback, punishment, or action answering a perceived wrong or injury; retaliatory acts, targeting offenders, punishment, or settling scores."}],"aiThemeChoices":[{"code":"PFM0102","name":"Cozy","kind":"fusion","primIds":["P01","P02"],"matrixVersion":"0.0.0.0","aiMeaning":"Comforting, snug, warm, sheltered, or inviting; soft textures, warm lighting, blankets, relaxed intimate settings, or a feeling of ease, rest, or pleasant closeness."},{"code":"PFM0103","name":"Pitiful","kind":"fusion","primIds":["P01","P03"],"matrixVersion":"0.0.0.0","aiMeaning":"Arousing sympathy or compassion through visible helplessness, suffering, misfortune, weakness, neglect, injury, abandonment, or pleading."},{"code":"PFM0104","name":"Goofy","kind":"fusion","primIds":["P01","P04"],"matrixVersion":"0.0.0.0","aiMeaning":"Silly, awkward, playful, foolish, or ridiculous in an amusing way; exaggerated expressions, clumsy antics, or playful visual absurdity.\nGate: Ordinary resting, reclining, standing, sitting, relaxation, incidental awkwardness, clutter, or an unusual-looking scene is not Goofy by itself. Goofy requires actual amusing silliness, foolishness, clumsy antics, playful absurdity, exaggerated comic behavior or expression, or comparable laughter-producing incongruity. Do not infer playfulness merely from relaxation, mess, or an ordinary pose."},{"code":"PFM0105","name":"Joy","kind":"fusion","primIds":["P01","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Happiness, delight, pleasure, or emotional uplift shown through smiling, laughter, delighted expressions, playful pleasure, or visible enjoyment."},{"code":"PFM0106","name":"Bizarre","kind":"fusion","primIds":["P01","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Strange, unusual, unexpected, peculiar; improbable combinations, anomalous forms, or unexplained oddities."},{"code":"PFM0107","name":"Camp","kind":"fusion","primIds":["P01","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Exaggerated, theatrical, artificial, flamboyant, kitschy, or knowingly excessive styling and presentation."},{"code":"PFM0108","name":"Whimsical","kind":"fusion","primIds":["P01","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Fanciful, playful, imaginative, lightly odd, or guided by charming logic; fantasy details, charming oddities, or impossible elements."},{"code":"PFM0109","name":"Kawaii","kind":"fusion","primIds":["P01","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Highly stylized Japanese cute aesthetic using exaggerated sweetness or toy-like, childlike, or chibi-style proportions."},{"code":"PFM0110","name":"UglyCute","kind":"fusion","primIds":["P01","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"“So ugly it’s cute” appeal: unattractive, awkward, scruffy, misshapen, grotesque, gross-looking, or otherwise visually off-putting qualities that become endearing, charming, funny, lovable, or cute; the ugliness or ickiness is itself part of the appeal.\nEvidence can include troll-like dolls, scruffy animals, odd little creatures, misshapen toys, awkward faces or proportions, strange character designs, or other subjects whose off-putting features actively increase their endearment.\nGate: Dirt, grime, filth, clutter, ugliness, disgust, or cuteness alone is not UglyCute. The image must combine genuine off-putting, ugly, or icky qualities with genuine cute or endearing appeal, and the undesirable quality must contribute to the affection rather than merely coexist with it."},{"code":"PFM0111","name":"CreepyCute","kind":"fusion","primIds":["P01","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Cute and unsettling at once; Halloween fun. Appealing subjects combined with eerie, spooky, uncanny, or disturbing features."},{"code":"PFM0112","name":"Innocence","kind":"fusion","primIds":["P01","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Openness, inexperience, trust, simplicity, or freedom from corruption; childlike expressions, gentleness, or naive imagery."},{"code":"PFM0113","name":"Playful","kind":"fusion","primIds":["P01","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Lighthearted, mischievous, teasing, game-like, curious, imaginative, or inclined toward fun and experimentation; playful role-taking, dress-up, character customization, make-believe, games, toys, teasing gestures, spontaneous fun, or deliberately fun self-presentation.\nClarification: Playful does not require laughter, toys, overt antics, or childish behavior. Role-play, dress-up, character experimentation, and deliberately fun or lighthearted presentation can independently support Playful when they function as play."},{"code":"PFM0114","name":"Saccharine","kind":"fusion","primIds":["P01","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Excessively sweet, sentimental, precious, or cutesy to the point of irritation; sugary, pastel, cloying, aggressively sweet imagery.\nGate: “Excessive” means excessive sweetness, sentimentality, preciousness, or cutesiness—not clutter, quantity, chaos, decoration, intensity, or visual excess. Pastel colors alone are not Saccharine unless they contribute to a clearly sugary, cloying, aggressively sweet, sentimental, or cutesy presentation."},{"code":"PFM0203","name":"Melancholic","kind":"fusion","primIds":["P02","P03"],"matrixVersion":"0.0.0.0","aiMeaning":"Sad, wistful, reflective, or touched by longing and loss; downcast expressions, solitude, rain, fading light, or emotional heaviness."},{"code":"PFM0204","name":"Charming","kind":"fusion","primIds":["P02","P04"],"matrixVersion":"0.0.0.0","aiMeaning":"Pleasantly attractive, likable, engaging, or delightful in a way that wins affection; inviting expressions, warmth, approachable elegance, or pleasing details."},{"code":"PFM0205","name":"Majestic","kind":"fusion","primIds":["P02","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Grand, dignified, regal, imposing, or awe-inspiring in scale, presence, or bearing; symmetry, noble posture, stately beauty, or impressive scenery."},{"code":"PFM0206","name":"Surreal","kind":"fusion","primIds":["P02","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Dreamlike, impossible, uncanny, or illogical in an altered reality; distorted scale, impossible spaces, or unexpected object combinations.\nGate: Unusual, cluttered, confusing, eccentric, or visually busy imagery is not Surreal by itself. Ordinary people, rooms, objects, poses, or combinations remain ordinary unless the image actually alters reality through impossible spatial relationships, impossible or transformed objects, distorted scale, dream-logic, physically impossible events, or a clearly uncanny break from normal reality. Do not infer “dreamlike,” “impossible,” or “distorted” merely because a scene is strange, disorganized, or difficult to interpret."},{"code":"PFM0207","name":"Irreverent","kind":"fusion","primIds":["P02","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Disrespectful, cheeky, mocking, or dismissive toward seriousness, convention, authority, or decorum; visual disrespect toward sacred, formal, or authoritative symbols."},{"code":"PFM0208","name":"Romance","kind":"fusion","primIds":["P02","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Affection, longing, intimacy, courtship, tenderness, or romantic attraction; couples, affectionate gestures, closeness, or romantic settings."},{"code":"PFM0209","name":"Exposure","kind":"fusion","primIds":["P02","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Being naked, indecently revealed, or too visibly exposed, especially in ways that feel shameful, embarrassing, humiliating, or sexually charged; visible nudity, uncovered body parts, flashing, revealing poses, or accidental bodily exposure."},{"code":"PFM0210","name":"Grotesque","kind":"fusion","primIds":["P02","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Whimsical or ornamental distortion mixing beauty, absurdity, or unease; hybrid human, animal, or plant forms, exaggerated features, decorative symmetry, or playful violations of natural law."},{"code":"PFM0211","name":"Vulnerable","kind":"fusion","primIds":["P02","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Exposed to harm, rejection, injury, loss, or emotional pain; defenseless posture, exposed emotion, isolation, or injury."},{"code":"PFM0212","name":"Elegant","kind":"fusion","primIds":["P02","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Graceful, refined, tasteful, polished, restrained, or well composed; sophisticated detail, balanced composition, graceful forms, or controlled styling."},{"code":"PFM0213","name":"Festive","kind":"fusion","primIds":["P02","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Marked by celebration, holidays, ceremonies, or special occasions; decorations, costumes, lights, ornaments, seasonal styling, or celebratory settings."},{"code":"PFM0214","name":"Pretentious","kind":"fusion","primIds":["P02","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Affected, self-important, showy, or overly cultured or significant; conspicuous status display and affected refinement."},{"code":"PFM0304","name":"Ironic","kind":"fusion","primIds":["P03","P04"],"matrixVersion":"0.0.0.0","aiMeaning":"Tragic or unfortunate situations made funny through unexpected contrast, reversal, or coincidence. Or happy situations ruined by an unexpected reversal."},{"code":"PFM0305","name":"Devastating","kind":"fusion","primIds":["P03","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Causing profound damage, loss, grief, shock, defeat, or emotional destruction; catastrophic ruin, collapse, severe aftermath, or overwhelming loss."},{"code":"PFM0306","name":"Nightmarish","kind":"fusion","primIds":["P03","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Resembling a nightmare; frightening, disturbing, unreal, oppressive, or horrifying, with dream logic, threatening distortions, darkness, or impossible danger."},{"code":"PFM0307","name":"Shame","kind":"fusion","primIds":["P03","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Painful self-conscious disgrace, embarrassment, exposure, or feeling unworthy, judged, or wanting to hide; averted gaze, covered face, hiding posture, blushing, shrinking, or visibly caught embarrassment."},{"code":"PFM0308","name":"Liminal","kind":"fusion","primIds":["P03","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"In-between, transitional, eerily suspended, or depopulated spaces that feel familiar yet uncanny; thresholds, corridors, waiting areas, empty commercial or institutional interiors, backrooms-like environments, or places that feel caught between use and abandonment.\nEvidence can include hallways, doorways, stairwells, lobbies, parking areas, empty stores, offices, schools, or rooms whose lighting, emptiness, repetition, silence, or spatial ambiguity create an uncanny “between states” feeling.\nGate: Solitude, clutter, quiet, calm, or an ordinary room is not Liminal by itself. One person alone is not enough. Clutter is not sparseness. Quiet is not uncanny stillness. The image must convey a genuine threshold, transitional, depopulated, suspended, or familiar-but-off atmosphere beyond simple emptiness or being alone."},{"code":"PFM0309","name":"Humiliation","kind":"fusion","primIds":["P03","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Demeaning, degrading, ridiculing, belittling, infantilizing, exposing, or stripping someone of dignity.\nEvidence can include degrading treatment, public ridicule, forced exposure, visible embarrassment or submission, insulting labels or messages, or costumes, tattoos, markings, symbols, or body presentation that clearly function to demean, belittle, infantilize, ridicule, embarrass, or strip the subject of dignity.\nGate: A costume, tattoo, marking, label, symbol, exposure, or unusual presentation is not Humiliation by itself. It must carry a clearly degrading, belittling, ridiculing, infantilizing, or dignity-reducing meaning in context."},{"code":"PFM0310","name":"Despair","kind":"fusion","primIds":["P03","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Hopelessness, anguish, defeat, or the sense that relief or improvement has disappeared; collapsed posture, ruin, isolation, or hopeless expressions."},{"code":"PFM0311","name":"Foreboding","kind":"fusion","primIds":["P03","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Uneasy expectation that danger, trouble, harm, or an unwanted event is approaching; ominous shadows, stormy skies, suspense, or approaching threat."},{"code":"PFM0312","name":"Poignant","kind":"fusion","primIds":["P03","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Emotionally affecting through tenderness, sadness, meaning, or reflection; fragile moments, remembrance, meaningful loss, or emotional stillness."},{"code":"PFM0313","name":"Bittersweet","kind":"fusion","primIds":["P03","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Pleasure and sadness experienced together; joyful imagery touched by loss, nostalgia, farewell, memory, or impermanence."},{"code":"PFM0314","name":"Dysphoria","kind":"fusion","primIds":["P03","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Distress, dissatisfaction, unease, or disconnection involving self, body, identity, mood, or circumstance; bodily discomfort, alienation, or self-disconnection."},{"code":"PFM0405","name":"Cringe","kind":"fusion","primIds":["P04","P05"],"matrixVersion":"0.0.0.0","aiMeaning":"Painful awkwardness or embarrassment that causes secondhand discomfort; social blunders, failed interactions, awkward expressions, or embarrassing poses."},{"code":"PFM0406","name":"Zany","kind":"fusion","primIds":["P04","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Eccentric, unconventional, comically strange, or offbeat; mismatched costumes, unusual poses, frantic antics, or energetic comic behavior.\nGate: Ordinary resting, reclining, standing, sitting, or incidental poses are not Zany merely because they look unusual in isolation. General clutter, mismatched household objects, or visual disorder are not “mismatched costumes.” Zany requires genuinely eccentric, deliberately unconventional, comically strange, offbeat, frantic, or energetically comic behavior, styling, or presentation."},{"code":"PFM0407","name":"Satirical","kind":"fusion","primIds":["P04","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Using humor, irony, exaggeration, or ridicule to expose or criticize faults, behavior, institutions, or ideas; visual mockery of politics, culture, or social conventions."},{"code":"PFM0408","name":"Absurd","kind":"fusion","primIds":["P04","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Illogical, ridiculous, contradictory, pointless, impossible, or incompatible with ordinary sense; nonsensical juxtapositions, impossible logic, or ridiculous contradictions."},{"code":"PFM0409","name":"Ribaldry","kind":"fusion","primIds":["P04","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Coarse, bawdy, or sexually suggestive humor; sexual jokes, innuendo, vulgar comedy, bawdy gestures, or suggestive comic situations."},{"code":"PFM0410","name":"Grossout","kind":"fusion","primIds":["P04","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Humor or spectacle built around filth, bodily functions, fluids, decay, gore, infestation, vermin, or revulsion; vomit, excrement, bodily fluids, gross material, bugs, rats, flies, or other unclean/vermin-associated creatures used to create grossness or disgust.\nBoundary: Bugs, rats, flies, or other creatures are not Grossout merely because they are present. They contribute when they function as evidence of filth, uncleanness, contamination, infestation, decay, or revulsion in context."},{"code":"PFM0411","name":"ComedyHorror","kind":"fusion","primIds":["P04","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Frightening or macabre material blended with humor, parody, absurdity, slapstick, jokes, or comic relief."},{"code":"PFM0412","name":"Witty","kind":"fusion","primIds":["P04","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Clever, quick, inventive, or skillful humor and insight; visual puns, layered references, wordplay, or ingenious humorous juxtapositions."},{"code":"PFM0413","name":"PartyTime","kind":"fusion","primIds":["P04","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Active social celebration centered on revelry, fun, gathering, or excitement; dancing, cheering, crowds, drinks, decorations, music, or confetti."},{"code":"PFM0414","name":"Trolling","kind":"fusion","primIds":["P04","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Provoking, baiting, mocking, annoying, or misleading others for amusement or reaction; antagonistic jokes, mocking memes, baiting signs, or provocative gestures."},{"code":"PFM0506","name":"Chaotic","kind":"fusion","primIds":["P05","P06"],"matrixVersion":"0.0.0.0","aiMeaning":"Disordered, unstable, crowded, conflicting, or lacking control or organization; scattered objects, unstable motion, visual overload, or competing elements."},{"code":"PFM0507","name":"Outrageous","kind":"fusion","primIds":["P05","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Shockingly excessive, bold, offensive, audacious, unconventional, or beyond restraint; extreme styling, taboo-breaking, flamboyance, or audacious behavior."},{"code":"PFM0508","name":"Epic","kind":"fusion","primIds":["P05","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Grand, heroic, or massive in scale, consequence, duration, drama, adventure, struggle, achievement, or spectacle; monumental scenery, heroic action, or high stakes."},{"code":"PFM0509","name":"Lust","kind":"fusion","primIds":["P05","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexual desire, appetite, craving, fixation, or physical attraction; desirous gazes, sensual bodies, erotic focus, or visible craving."},{"code":"PFM0510","name":"Brutal","kind":"fusion","primIds":["P05","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Harsh, violent, cruel, punishing, damaging, or unsparing in force or effect; severe injury, destruction, cruelty, or punishing conditions."},{"code":"PFM0511","name":"Terror","kind":"fusion","primIds":["P05","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Extreme fear, alarm, panic, dread, or immediate danger; terrified expressions, fleeing, overwhelming threat, or visible panic."},{"code":"PFM0512","name":"Brilliant","kind":"fusion","primIds":["P05","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Clever, inventive, insightful, creative, effective, or intellectually impressive; ingenious designs, exceptional craftsmanship, inventive solutions, or impressive execution."},{"code":"PFM0513","name":"Pride","kind":"fusion","primIds":["P05","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Satisfaction, self-respect, dignity, or affirmation tied to achievement, identity, belonging, or worth; gay or LGBT imagery; confident posture, identity symbols, or dignified self-presentation."},{"code":"PFM0514","name":"Aggressive","kind":"fusion","primIds":["P05","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Confrontational, forceful, hostile, threatening, domineering, or ready to attack; attack gestures, weapons, intimidation, forceful motion, or threatening posture."},{"code":"PFM0607","name":"Freakshow","kind":"fusion","primIds":["P06","P07"],"matrixVersion":"0.0.0.0","aiMeaning":"Bizarre, degrading, dysfunctional, shocking, or socially transgressive people, situations, lifestyles, or spectacles that provoke fascinated, guilty, voyeuristic, or trainwreck-like attention; something disturbing, embarrassing, abnormal, or shameful that is compelling to look at.\nEvidence can include unusual performers or exhibited subjects, carnival/sideshow-like presentation, gawking attention, conspicuous dysfunction, degrading living conditions, humiliating or bizarre personal presentation, shocking anomalies, or situations whose very wrongness or dysfunction makes them fascinating to observe.\nGate: Mere clutter, eccentricity, poverty, unusual appearance, or disorder is not Freakshow by itself. The scene must actually carry a sense of bizarre, degrading, dysfunctional, shocking, embarrassing, or transgressive spectacle that invites fascinated or trainwreck-like attention."},{"code":"PFM0608","name":"Psychedelic","kind":"fusion","primIds":["P06","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Hallucinatory, sensory-rich, perception-bending, or suggestive of expanded or distorted consciousness; vivid colors, swirling patterns, fractals, or hallucination-like effects."},{"code":"PFM0609","name":"FreakyDeaky","kind":"fusion","primIds":["P06","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexually playful, unconventional, eccentric, uninhibited, or erotic with an oddball edge; strange erotic styling, playful erotic imagery, or unconventional sexual presentation."},{"code":"PFM0610","name":"Mutant","kind":"fusion","primIds":["P06","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Biological form altered from a known prototype through mutation, radiation, chemicals, genetics, abnormal development, hybridization, or evolution; extra limbs, altered organs, abnormal growths, or techno-organic fusion."},{"code":"PFM0611","name":"Macabre","kind":"fusion","primIds":["P06","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Gothic morbidity centered on death, corpses, decay, mortality, funerary imagery, or morbid fascination; skulls, graves, death rituals, or ornate morbid decoration."},{"code":"PFM0612","name":"Alien","kind":"fusion","primIds":["P06","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Strange, foreign, unfamiliar, or nonhuman; suggesting intelligence, biology, places, or forms outside ordinary human experience. Unfamiliar beings, strange anatomy, spacecraft, foreign environments, otherworldly landscapes, or unfamiliar technology."},{"code":"PFM0613","name":"Delirious","kind":"fusion","primIds":["P06","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Disoriented, feverish, ecstatic, manic, confused, or detached from stable reality; hallucinations, unstable visual reality, feverish expressions, or ecstatic chaos."},{"code":"PFM0614","name":"Monstrous","kind":"fusion","primIds":["P06","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Awe-inspiring unnatural threat defined by immense scale, predation, mythic power, or eldritch otherness; colossal creatures, chimeric anatomy, predatory weapons, and impossible features."},{"code":"PFM0708","name":"Medicated","kind":"fusion","primIds":["P07","P08"],"matrixVersion":"0.0.0.0","aiMeaning":"Altered, softened, detached, or chemically influenced consciousness or perception; drowsy eyes, softened expressions, detached gaze, pills, or clinical sedation cues."},{"code":"PFM0709","name":"Exploitation","kind":"fusion","primIds":["P07","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Using people, bodies, suffering, taboo, shock, or sensational material for advantage, attention, profit, or gratification; objectification, commodification, or spectacle built from others."},{"code":"PFM0710","name":"Tasteless","kind":"fusion","primIds":["P07","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Vulgar, crude, offensive, insensitive, indecent, or lacking judgment or restraint; socially or aesthetically offensive imagery or insensitive presentation."},{"code":"PFM0711","name":"Execrable","kind":"fusion","primIds":["P07","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Hateful, detestable, contemptible, vile, cruel, or deserving condemnation; deliberately abhorrent content or visible malice."},{"code":"PFM0712","name":"Parodic","kind":"fusion","primIds":["P07","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Imitating a recognizable style, work, person, or convention through exaggeration, distortion, mockery, or comic transformation.\nBoundary: Clutter, mess, or an exaggerated-looking scene is not Parodic by itself. The evidence must identify a recognizable style, work, person, convention, archetype, or trope and show how the image imitates, exaggerates, distorts, mocks, or comically transforms it."},{"code":"PFM0713","name":"Snarky","kind":"fusion","primIds":["P07","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Sarcastic, cutting, mocking, dismissive, or contemptuous humor; eye-rolls, smirks, mocking gestures, sarcastic captions, or dismissive commentary.\nGate: General humor, silliness, playfulness, costumes, joking, lighthearted behavior, or funny-looking situations are not Snarky by themselves. Snarky requires a specifically sarcastic, cutting, mocking, dismissive, or contemptuous quality—such as a sarcastic remark or caption, mocking imitation, derisive expression or gesture, eye-roll, smirk, or humor clearly directed at belittling or dismissing a person, idea, behavior, or situation."},{"code":"PFM0714","name":"Wickedness","kind":"fusion","primIds":["P07","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Wrongdoing, cruelty, malice, corruption, immorality, or pleasure in harmful behavior; deliberate harm, malicious intent, corruption, or gleeful wrongdoing."},{"code":"PFM0809","name":"Limerence","kind":"fusion","primIds":["P08","P09"],"matrixVersion":"0.0.0.0","aiMeaning":"Romantic infatuation marked by longing, idealization, uncertainty, fantasy, or desire for reciprocation; idealized crush imagery, fixation, longing gazes, or unreciprocated yearning.\nGate: Longing, staring, daydreaming, sadness, solitude, fixation, lying in bed, or an upward/distant gaze is not Limerence by itself. There must be clear evidence that the longing, fantasy, fixation, idealization, uncertainty, or desire for reciprocation is specifically romantic and directed toward another person or romantic attachment. Do not infer romantic infatuation from posture, gaze direction, mood, clutter, or isolation alone."},{"code":"PFM0810","name":"Putrid","kind":"fusion","primIds":["P08","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Rotten, decaying, foul, contaminated, corrupt, or unpleasant; decomposition, mold, slime, spoiled matter, or contamination."},{"code":"PFM0811","name":"Eerie","kind":"fusion","primIds":["P08","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Unsettling, haunting, uncanny, quiet, mysterious, or suggestive that something is wrong; strange shadows, emptiness, haunting stillness, or subtle wrongness."},{"code":"PFM0812","name":"Ethereal","kind":"fusion","primIds":["P08","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Airy, delicate, luminous, weightless, otherworldly, or removed from ordinary physical substance; soft glow, translucence, mist, or delicate forms."},{"code":"PFM0813","name":"Magical","kind":"fusion","primIds":["P08","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Enchanting, supernatural, wondrous, impossible, or governed by forces from a different reality; spells, glowing effects, impossible transformations, enchanted beings, or supernatural phenomena."},{"code":"PFM0814","name":"Phantasmagoric","kind":"fusion","primIds":["P08","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Elaborate grotesque fantasy with bizarre creatures, impossible forms, or disturbing imagery."},{"code":"PFM0910","name":"Lewd","kind":"fusion","primIds":["P09","P10"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexually explicit, vulgar, indecent, crude, suggestive, or offensively erotic; explicit exposure, crude sexual gestures, vulgar erotic jokes, or indecent posing."},{"code":"PFM0911","name":"Seduction","kind":"fusion","primIds":["P09","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Attraction created through allure, temptation, mystery, danger, or sexual invitation; alluring poses, intimate gaze, revealing styling, or a dangerous sensual atmosphere."},{"code":"PFM0912","name":"Kinky","kind":"fusion","primIds":["P09","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Sexually unconventional, fetish-oriented, experimental, role-based, or involving nonstandard preferences or practices; fetish attire, bondage cues, role-play, or unconventional erotic props."},{"code":"PFM0913","name":"Hedonism","kind":"fusion","primIds":["P09","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Pleasure, gratification, sensual enjoyment, luxury, appetite, or indulgence elevated into an atmosphere or lifestyle; feasting, partying, lavish consumption, sensual abundance, or decadent excess."},{"code":"PFM0914","name":"Sadomasochism","kind":"fusion","primIds":["P09","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Erotic pleasure involving pain, domination, submission, humiliation, control, or suffering; bondage, power exchange, or controlled physical pain."},{"code":"PFM1011","name":"Horror","kind":"fusion","primIds":["P10","P11"],"matrixVersion":"0.0.0.0","aiMeaning":"Fear, dread, shock, or revulsion produced by disturbing, threatening, grotesque, supernatural, or violent material; monsters, gore, frightening scenes, or supernatural danger.\nGate: Clutter, disorder, neglect, darkness, an ordinary room, a person lying still, or an inactive television is not Horror by itself. Horror requires actual evidence of fear, dread, shock, or revulsion arising from disturbing, threatening, grotesque, supernatural, violent, or clearly ominous material. Do not infer frightening scenes, supernatural danger, violence, or threat from ordinary objects or ambiguous surroundings without concrete supporting evidence."},{"code":"PFM1012","name":"Greed","kind":"fusion","primIds":["P10","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Excessive desire to possess, acquire, keep, or control wealth, resources, status, power, or advantage; hoarding, grabbing valuables, status fixation, or acquisitiveness."},{"code":"PFM1013","name":"Indulgent","kind":"fusion","primIds":["P10","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Permissive toward pleasure, appetite, comfort, luxury, excess, or personal gratification; rich food, lounging, pampering, luxury, or overconsumption."},{"code":"PFM1014","name":"Repulsive","kind":"fusion","primIds":["P10","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Immediate visceral disgust caused by decay, contamination, bodily fluids, wounds, infection, or organic breakdown; rotting flesh, pus, vomit, lesions, parasites, or formless slime."},{"code":"PFM1112","name":"Paranoia","kind":"fusion","primIds":["P11","P12"],"matrixVersion":"0.0.0.0","aiMeaning":"Persistent suspicion or fear of harm, deception, surveillance, persecution, or hidden threat; watchful fear, suspicious glances, defensive behavior, or surveillance imagery."},{"code":"PFM1113","name":"Spirituality","kind":"fusion","primIds":["P11","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Meaning, transcendence, sacredness, inner life, faith, ritual, or connection beyond ordinary material existence; prayer, meditation, worship, sacred symbols, or mystical connection."},{"code":"PFM1114","name":"Violated","kind":"fusion","primIds":["P11","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"A boundary, body, trust, right, safety, privacy, or autonomy invaded or broken; forced intrusion, damaged privacy, assault aftermath, or breached safety."},{"code":"PFM1213","name":"Glory","kind":"fusion","primIds":["P12","P13"],"matrixVersion":"0.0.0.0","aiMeaning":"Honor, acclaim, valor, prestige, or celebrated achievement; trophies, medals, military honors, victory displays, heroic poses, or public recognition."},{"code":"PFM1214","name":"Obsessive","kind":"fusion","primIds":["P12","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Fixated, compulsive, preoccupied, repetitive, or unable to release attention from a person, idea, goal, or concern; repeated patterns, hoarding, compulsive arrangement, or relentless focus.\nGate: Ordinary clutter, mess, or casual attention is not Obsessive by itself. A still image can support Obsessive when it visibly shows the accumulated effects of persistent fixation, compulsion, or inability to let go—such as hoarding, excessive accumulation, overwhelming possession density, repeated buildup, ritualized arrangement, or an environment substantially dominated by a person’s preoccupation. Do not invent an unrelated fixation when the visible evidence supports a different obsessive route."},{"code":"PFM1314","name":"Revenge","kind":"fusion","primIds":["P13","P14"],"matrixVersion":"0.0.0.0","aiMeaning":"Retaliation, payback, punishment, or action answering a perceived wrong or injury; retaliatory acts, targeting offenders, punishment, or settling scores."}]};

const strip = text => String(text||'')
  .trim()
  .replace(/^```(?:json)?\s*/i,'')
  .replace(/\s*```$/,'')
  .trim();

const parse = text => {
  const clean = strip(text);
  try { return JSON.parse(clean); }
  catch {
    const a = clean.indexOf('{');
    const b = clean.lastIndexOf('}');
    if (a >= 0 && b > a) {
      try { return JSON.parse(clean.slice(a,b+1)); } catch {}
    }
    throw new Error('Vision provider returned invalid JSON');
  }
};

const responseValue = payload =>
  typeof payload === 'string'
    ? payload
    : (payload?.response ?? payload?.result?.response ?? payload?.output_text ?? '');

const safeProviderDiagnostic = payload => {
  const value = responseValue(payload);
  const type = Array.isArray(value) ? 'array' : typeof value;
  let preview = null;

  if (typeof value === 'string') {
    preview = value.slice(0,1200);
  } else if (value && typeof value === 'object') {
    try { preview = JSON.stringify(value).slice(0,1200); }
    catch { preview = '[unserializable object]'; }
  } else if (value != null) {
    preview = String(value).slice(0,1200);
  }

  return {
    phase:'parse',
    payloadType:Array.isArray(payload) ? 'array' : typeof payload,
    responseType:type,
    responsePreview:preview
  };
};

/**
 * Attach provider diagnostics without mutating Error with an undeclared property.
 * @returns {Error}
 */
const diagnosticError = (message, diagnostic) => {
  const error = new Error(message);
  Object.defineProperty(error,'providerDiagnostic',{
    value:diagnostic,
    enumerable:false,
    configurable:true
  });
  return error;
};

const providerDiagnosticOf = error => {
  if (!error || typeof error !== 'object') return null;
  try { return Reflect.get(error,'providerDiagnostic') || null; }
  catch { return null; }
};

const parseProviderResponse = payload => {
  const value = responseValue(payload);
  if (value && typeof value === 'object') return value;
  try {
    return parse(value);
  } catch (error) {
    throw diagnosticError(
      error?.message || 'Vision provider returned invalid JSON',
      safeProviderDiagnostic(payload)
    );
  }
};

const tagImageMime = (bytes,mimeType) => {
  const mime=String(mimeType||'').split(';')[0].trim().toLowerCase();
  if (Array.isArray(bytes) && /^image\/[a-z0-9.+-]+$/i.test(mime)) {
    try { Object.defineProperty(bytes,'mimeType',{value:mime,enumerable:false,configurable:true}); } catch {}
  }
  return bytes;
};

const fetchBytes = async url => {
  if (!/^https:\/\//i.test(url) || url.length > 2000) throw new Error('imageUrl must be HTTPS');
  const response = await fetch(url,{headers:{accept:'image/*'}});
  if (!response.ok) throw new Error(`Could not retrieve image (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length) throw new Error('Image was empty');
  if (bytes.length > 6_000_000) throw new Error('Image exceeds 6 MB');
  return tagImageMime(Array.from(bytes),response.headers.get('content-type'));
};

const dataUrlBytes = value => {
  const match = String(value||'').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error('imageDataUrl must be a base64 image');
  const binary = atob(match[2]);
  if (binary.length > 6_000_000) throw new Error('Image exceeds 6 MB');
  return tagImageMime(Array.from(binary,c=>c.charCodeAt(0)),match[1]);
};

const imageMimeFromBytes = bytes => {
  const b=Array.isArray(bytes)?bytes:Array.from(bytes||[]);
  if (b[0]===0xff&&b[1]===0xd8&&b[2]===0xff) return 'image/jpeg';
  if (b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47) return 'image/png';
  if (b[0]===0x47&&b[1]===0x49&&b[2]===0x46&&b[3]===0x38) return 'image/gif';
  if (b[0]===0x52&&b[1]===0x49&&b[2]===0x46&&b[3]===0x46&&b[8]===0x57&&b[9]===0x45&&b[10]===0x42&&b[11]===0x50) return 'image/webp';
  if (b[0]===0x42&&b[1]===0x4d) return 'image/bmp';
  const brand=String.fromCharCode(...b.slice(4,12));
  if (/^ftypavi[fs]$/.test(brand)) return 'image/avif';
  if (/^ftyphei[cf]$/.test(brand)||/^ftyphev[csx]$/.test(brand)) return 'image/heic';
  return 'image/jpeg';
};

const imageBytesDataUrl = bytes => {
  const b=Array.isArray(bytes)?bytes:Array.from(bytes||[]);
  if (!b.length) throw new Error('Image was empty');
  let binary='';
  for (let i=0;i<b.length;i+=0x8000) binary+=String.fromCharCode(...b.slice(i,i+0x8000));
  return `data:${bytes?.mimeType||imageMimeFromBytes(b)};base64,${btoa(binary)}`;
};

function validateRegistry(registry){
  if (!registry || registry.matrixVersion !== '0.0.0.0') throw new Error('Unexpected PrimFusion Matrix version');
  if (!Array.isArray(registry.primitives) || registry.primitives.length !== 14) throw new Error('PrimFusion registry must contain 14 Prims');
  if (!Array.isArray(registry.fusions) || registry.fusions.length !== 91) throw new Error('PrimFusion registry must contain 91 fusions');
  if (!Array.isArray(registry.themeChoices) || registry.themeChoices.length !== 105) throw new Error('PrimFusion registry must contain 105 total Theme choices');
  if (!Array.isArray(registry.aiThemeChoices) || registry.aiThemeChoices.length !== 91) throw new Error('PrimFusion registry must contain 91 AI Theme choices');
  for (const fusion of registry.fusions){
    const [a,b] = fusion.primIds || [];
    if (!a || !b || Number(a.slice(1)) >= Number(b.slice(1))) {
      throw new Error(`Invalid low-to-high fusion code: ${fusion.code||'unknown'}`);
    }
  }
  return registry;
}

validateRegistry(PRIMFUSION_REGISTRY);

const matrixVersion = () => PRIMFUSION_REGISTRY.matrixVersion;

function reactionPrompt({useImage=true,descriptionContext='',lineProtocol=false,requireNotes=false}={}){
  const lines = PRIMFUSION_REGISTRY.primitives.map(p => {
    const meaning = p.aiMeaning ? ` Meaning: ${p.aiMeaning}` : '';
    return `${p.id} — ${p.name}.${meaning}`;
  }).join('\n');
  const description=String(descriptionContext||'').trim().slice(0,6000);
  const useDescription=Boolean(description);
  const evidenceRule=useImage&&useDescription
    ? `Analyze the image and the supplied AI Description together as two evidence sources. Use the Description as observational context, not as prior Reaction scoring. When they differ, judge the reaction field from the total available evidence.`
    : useDescription
      ? `Analyze ONLY the supplied AI Description. No image is provided for this rerun. Do not invent visual evidence beyond what the Description states.`
      : `Analyze the image as the sole evidence source.`;
  const noteRule=useImage?'image-grounded':'description-grounded';
  const descriptionBlock=useDescription?`\n\nAI DESCRIPTION EVIDENCE:\n${description}`:'';
  const ids=PRIMFUSION_REGISTRY.primitives.map(p=>p.id);
  const noteInstruction=(lineProtocol&&!requireNotes)
    ? `Reaction Reasons were not requested for this run. Do not add NOTE or rationale lines.`
    : `Provide concise ${noteRule} notes for the first FOUR ranked reactions. Those notes are an effort check showing that the primary, secondary, and nearest alternatives were actually considered. A genuinely single-dominant case is allowed; if ranks 2-4 are weak or unsupported, say so rather than inventing support.`;
  const outputRule=lineProtocol
    ? `Return ONLY this compact plain-text protocol; do not return JSON, Markdown, labels, percentages, or commentary:\n${ids.map(id=>`${id}|<number from 0 to 100>`).join('\n')}\nRANKING|<all 14 P-codes strongest-to-weakest, comma-separated, each exactly once>${requireNotes?`\nNOTE|<rank-1 P-code>|<brief ${noteRule} reason>\nNOTE|<rank-2 P-code>|<brief ${noteRule} reason>\nNOTE|<rank-3 P-code>|<brief ${noteRule} reason>\nNOTE|<rank-4 P-code>|<brief ${noteRule} reason>`:''}\nEvery P01-P14 line is mandatory and its second field must be a bare numeric value.`
    : `Return one JSON object matching the structure below.\nThe object must contain:\n- weights: P01 through P14, each as a JSON number from 0 to 100\n- ranking: all 14 P-codes strongest-to-weakest, each exactly once\n- notes: exactly four objects for ranks 1-4, each with id and a brief ${noteRule} reason\nDo not put numbers in percent strings. Do not wrap the JSON in Markdown or code fences.`;

  return `You are performing Genreactrix Reaction Analysis.

${evidenceRule}
Choose among all 14 Genreactrix reaction buttons at the same time.
The P-codes are identifiers only. Reaction Analysis is independent from Theme/PrimFusion analysis.

Your job is semantic comparison, NOT arithmetic and NOT 14 independent confidence ratings.
For every reaction, assign a NONNEGATIVE RELATIVE WEIGHT from 0 to 100. The weights do NOT need to total 100 or any other number. A larger weight means that reaction deserves a larger share of the viewer's overall reaction field compared with the other 13 reactions.

Rank ALL 14 reactions from strongest to weakest. Rank #1 is the primary reaction. Rank #2 is the required secondary reaction candidate: identify the best-supported alternative even when it is much weaker than the primary. Do not stop after finding one obvious reaction.

${noteInstruction}

Do not make every weight identical. Do not return all zeros. Do not use Theme names or Theme reasoning to choose the reactions.

REACTION PRIMS:
${lines}${descriptionBlock}

${outputRule}`;
}

function reactionSchema(){
  const ids = PRIMFUSION_REGISTRY.primitives.map(p=>p.id);
  const properties = Object.fromEntries(ids.map(id=>[id,{type:'number',minimum:0,maximum:100}]));
  return {
    type:'object',
    properties:{
      weights:{
        type:'object',
        properties,
        required:ids,
        additionalProperties:false
      },
      ranking:{
        type:'array',
        minItems:14,
        maxItems:14,
        items:{type:'string',enum:ids},
      },
      notes:{
        type:'array',
        minItems:4,
        maxItems:4,
        items:{
          type:'object',
          properties:{
            id:{type:'string',enum:ids},
            reason:{type:'string'}
          },
          required:['id','reason'],
          additionalProperties:false
        }
      }
    },
    required:['weights','ranking','notes'],
    additionalProperties:false
  };
}

function reactionObjectCandidate(text){
  const raw = String(text||'').trim();
  const candidates = [raw];
  const a = raw.indexOf('{'), b = raw.lastIndexOf('}');
  if (a >= 0 && b > a) candidates.push(raw.slice(a,b+1));
  for (const candidate of candidates){
    try{
      const value = JSON.parse(candidate.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim());
      if (value && typeof value === 'object' && !Array.isArray(value)) return value;
    }catch{}
  }
  return null;
}

function parseReactionText(text){
  const ids = PRIMFUSION_REGISTRY.primitives.map(p=>p.id);
  const weights = {};
  let ranking = null;
  const notes = [];
  const raw = String(text||'').replace(/```(?:text|json)?/gi,'').trim();

  const reactionNumber = value => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
    const match = String(value ?? '').match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : NaN;
  };

  // Accept JSON/object-shaped output even though the prompt requests plain text.
  // Tolerate both keyed objects and common arrays such as
  // [{id:'P01', relative_weight:90}, ...].
  const objectCandidate = reactionObjectCandidate(raw);
  if (objectCandidate){
    const sourceWeights = objectCandidate.weights || objectCandidate.reactions || objectCandidate;
    if (Array.isArray(sourceWeights)) {
      for (const item of sourceWeights) {
        const id = String(item?.id ?? item?.code ?? item?.reaction ?? '').toUpperCase();
        const nested = item?.relative_weight ?? item?.relativeWeight ?? item?.weight ?? item?.score ?? item?.value ?? item?.percentage ?? item?.percent;
        const n = reactionNumber(nested);
        if (ids.includes(id) && Number.isFinite(n)) weights[id] = n;
      }
    } else {
      for (const id of ids){
        const direct = sourceWeights?.[id];
        const nested = direct && typeof direct === 'object'
          ? (direct.relative_weight ?? direct.relativeWeight ?? direct.weight ?? direct.score ?? direct.value ?? direct.percentage ?? direct.percent)
          : direct;
        const n = reactionNumber(nested);
        if (Number.isFinite(n)) weights[id]=n;
      }
    }
    const objectRanking = objectCandidate.ranking || objectCandidate.rank || objectCandidate.order;
    if (Array.isArray(objectRanking)) ranking = objectRanking.map(x=>String(x?.id ?? x?.code ?? x).toUpperCase()).filter(x=>ids.includes(x));
    const objectNotes = objectCandidate.notes || objectCandidate.reasons || objectCandidate.reasoning;
    if (Array.isArray(objectNotes)){
      for (const item of objectNotes){
        const id=String(item?.id ?? item?.code ?? '').toUpperCase();
        const reason=String(item?.reason ?? item?.note ?? item?.rationale ?? '').trim();
        if (ids.includes(id) && reason) notes.push({id,reason});
      }
    } else if (objectNotes && typeof objectNotes === 'object') {
      for (const id of ids){
        const reason=String(objectNotes[id] ?? '').trim();
        if (reason) notes.push({id,reason});
      }
    }
  }

  for (const originalLine of raw.split(/\r?\n/)){
    const line = originalLine.trim().replace(/^[-*]\s*/,'').replace(/^\|\s*/,'').replace(/\s*\|$/,'');
    if (!line) continue;

    // Preferred protocol plus tolerant table/colon/equal variants. Also accept
    // a reaction label between the P-code and number, e.g. P01|Adorable|90.
    let m = line.match(/^(?:WEIGHT\s*[|:=,-]\s*)?(P\d{2})(?:\s*[|:=,-]\s*[^|:=,\d][^|:=,]*?)?\s*[|:=,-]\s*(-?\d+(?:\.\d+)?)(?:\s*%?)\b/i);
    if (m){
      const id=m[1].toUpperCase(), n=Number(m[2]);
      if (ids.includes(id) && Number.isFinite(n) && !(id in weights)) weights[id]=n;
    }

    const rankingMatch = line.match(/^(?:RANKING|RANK|ORDER)\s*[|:=]\s*(.+)$/i);
    if (rankingMatch){
      const found=(rankingMatch[1].match(/P\d{2}/gi)||[]).map(x=>x.toUpperCase()).filter(x=>ids.includes(x));
      if (found.length) ranking=found;
    }

    const noteMatch = line.match(/^(?:NOTE|REASON|RATIONALE)\s*[|:=]\s*(P\d{2})\s*[|:=]\s*(.+)$/i);
    if (noteMatch){
      const id=noteMatch[1].toUpperCase(), reason=noteMatch[2].trim();
      if (ids.includes(id) && reason && !notes.some(x=>x.id===id)) notes.push({id,reason});
    }
  }

  // Last-resort extraction of P-code/number pairs anywhere in the response.
  // Permit one short reaction-name/label field between the code and number.
  if (Object.keys(weights).length < ids.length){
    const pairRe = /\b(P\d{2})\b(?:\s*[|:=,-]\s*[^|:=,\d][^|:=,\n]{0,60})?\s*(?:[|:=,-]|\bis\b)?\s*(-?\d+(?:\.\d+)?)\s*%?/gi;
    let m;
    while ((m=pairRe.exec(raw))){
      const id=m[1].toUpperCase(), n=Number(m[2]);
      if (ids.includes(id) && Number.isFinite(n) && !(id in weights)) weights[id]=n;
    }
  }

  if (!ranking || ranking.length !== ids.length || new Set(ranking).size !== ids.length){
    const explicit = raw.match(/(?:RANKING|RANK|ORDER)\s*[|:=]\s*([^\n]+)/i);
    if (explicit){
      const found=(explicit[1].match(/P\d{2}/gi)||[]).map(x=>x.toUpperCase()).filter(x=>ids.includes(x));
      if (found.length===ids.length && new Set(found).size===ids.length) ranking=found;
    }
  }

  return {weights,ranking:ranking||[],notes,rawPreview:raw.slice(0,3000)};
}


function parseReactionLineProtocol(text,{requireNotes=false}={}){
  const ids=PRIMFUSION_REGISTRY.primitives.map(p=>p.id);
  const weights={};
  let ranking=[];
  const notes=[];
  const raw=String(text||'').replace(/```(?:text)?/gi,'').trim();
  for(const originalLine of raw.split(/\r?\n/)){
    const line=originalLine.trim().replace(/^[-*]\s*/,'');
    if(!line)continue;
    const weightMatch=line.match(/^(P\d{2})\s*\|\s*(-?\d+(?:\.\d+)?)\s*$/i);
    if(weightMatch){
      const id=weightMatch[1].toUpperCase(),value=Number(weightMatch[2]);
      if(ids.includes(id)&&Number.isFinite(value)&&!(id in weights))weights[id]=value;
      continue;
    }
    const rankingMatch=line.match(/^RANKING\s*\|\s*(.+)$/i);
    if(rankingMatch){
      ranking=(rankingMatch[1].match(/P\d{2}/gi)||[]).map(x=>x.toUpperCase());
      continue;
    }
    const noteMatch=line.match(/^NOTE\s*\|\s*(P\d{2})\s*\|\s*(.+)$/i);
    if(noteMatch){
      const id=noteMatch[1].toUpperCase(),reason=noteMatch[2].trim();
      if(ids.includes(id)&&reason&&!notes.some(row=>row.id===id))notes.push({id,reason});
    }
  }
  const missing=ids.filter(id=>!(id in weights));
  if(missing.length)throw diagnosticError(
    `Reaction combined-evidence response was missing numeric weights for ${missing.join(', ')}`,
    {phase:'reaction-combined-line-parse',missingPrimCodes:missing,responsePreview:raw.slice(0,1600)}
  );
  if(ranking.length!==ids.length||new Set(ranking).size!==ids.length||ranking.some(id=>!ids.includes(id)))throw diagnosticError(
    'Reaction combined-evidence response did not provide one complete 14-Prim ranking',
    {phase:'reaction-combined-line-parse',responsePreview:raw.slice(0,1600)}
  );
  if(requireNotes&&notes.length<4)throw diagnosticError(
    `Reaction combined-evidence response provided ${notes.length} usable notes instead of 4`,
    {phase:'reaction-combined-line-parse',responsePreview:raw.slice(0,1600)}
  );
  return{weights,ranking,notes,rawPreview:raw.slice(0,3000)};
}

function validateReactionAssessment(raw,{requireNotes=false}={}){
  const ids = PRIMFUSION_REGISTRY.primitives.map(p=>p.id);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Reaction assessment was not an object');
  const weights = {};
  for (const id of ids){
    const value = Number(raw.weights?.[id]);
    if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error(`Reaction relative weight for ${id} must be numeric from 0 to 100`);
    weights[id] = value;
  }
  const total = ids.reduce((sum,id)=>sum+weights[id],0);
  if (!(total > 0)) throw new Error('Reaction assessment returned all-zero relative weights');
  const distinctWeights = new Set(ids.map(id=>weights[id]));
  if (distinctWeights.size === 1) throw new Error('Reaction assessment was uninformative because all 14 relative weights were identical');

  let ranking = Array.isArray(raw.ranking) ? raw.ranking.map(String) : [];
  let rankingSource = 'ai';
  const validRanking = ranking.length === ids.length && new Set(ranking).size === ids.length && !ranking.some(id=>!ids.includes(id));
  const rankingContradicts = validRanking && ranking.some((id,i)=>i>0 && weights[id] > weights[ranking[i-1]] + 1e-9);
  if (!validRanking || rankingContradicts){
    // Formatting mistakes in the ranking must not discard an otherwise complete 14-way semantic assessment.
    // Derive order from the AI's own weights; deterministic Prim ID only breaks exact ties.
    ranking = [...ids].sort((a,b)=>weights[b]-weights[a] || a.localeCompare(b));
    rankingSource = 'worker-derived-from-ai-weights';
  }

  const noteMap = new Map();
  if (Array.isArray(raw.notes)){
    for (const item of raw.notes){
      const id=String(item?.id||'').toUpperCase(), reason=String(item?.reason||'').trim();
      if (ids.includes(id) && reason && !noteMap.has(id)) noteMap.set(id,reason);
    }
  }
  const topFour = ranking.slice(0,4);
  const notes = topFour.filter(id=>noteMap.has(id)).map(id=>({id,reason:noteMap.get(id)}));
  if (requireNotes && notes.length !== 4) throw new Error(`Reaction assessment provided ${notes.length} usable top-four effort notes instead of 4`);

  return {weights,ranking,notes,rankingSource};
}

function allocateReactionPool(assessment){
  const ids = PRIMFUSION_REGISTRY.primitives.map(p=>p.id);
  const total = ids.reduce((sum,id)=>sum+assessment.weights[id],0);
  const rankIndex = new Map(assessment.ranking.map((id,index)=>[id,index]));
  const rows = ids.map(id=>{
    const exact = assessment.weights[id] * 100 / total;
    const discretionary = Math.floor(exact);
    return {id,exact,discretionary,fraction:exact-discretionary};
  });
  let remaining = 100 - rows.reduce((sum,row)=>sum+row.discretionary,0);
  const remainderOrder = [...rows].sort((a,b)=>
    b.fraction-a.fraction ||
    (rankIndex.get(a.id)??99)-(rankIndex.get(b.id)??99) ||
    a.id.localeCompare(b.id)
  );
  for (let i=0;i<remaining;i++) remainderOrder[i % remainderOrder.length].discretionary += 1;

  const display = Object.fromEntries(rows.map(row=>[row.id,row.discretionary]));
  const rawAllocation = Object.fromEntries(rows.map(row=>[row.id,row.discretionary+1]));
  const displayTotal = Object.values(display).reduce((a,b)=>a+b,0);
  const rawTotal = Object.values(rawAllocation).reduce((a,b)=>a+b,0);
  if (displayTotal !== 100 || rawTotal !== 114) throw new Error('Worker reaction apportionment invariant failed');

  const primaryId = assessment.ranking[0], secondaryId = assessment.ranking[1];
  const pair = [primaryId,secondaryId].sort((a,b)=>Number(a.slice(1))-Number(b.slice(1)));
  const primFusionCode = `PFM${pair[0].slice(1)}${pair[1].slice(1)}`;
  const byId = new Map(PRIMFUSION_REGISTRY.primitives.map(p=>[p.id,p]));
  return {
    display,
    diagnostics:{
      scoringMethod:'ai-relative-weights-worker-hamilton-100-plus-14-baseline',
      rawAiWeights:assessment.weights,
      aiRanking:assessment.ranking,
      rankingSource:assessment.rankingSource||'ai',
      effortNotes:assessment.notes,
      discretionaryAllocation:display,
      rawAllocation,
      displayTotal,
      rawTotal,
      singleDominant:Object.values(assessment.weights).filter(v=>v>0).length===1,
      reactionCombo:{
        primaryId,
        primaryName:byId.get(primaryId)?.name||primaryId,
        secondaryId,
        secondaryName:byId.get(secondaryId)?.name||secondaryId,
        primFusionCode,
        normalizedReactionIds:pair
      }
    }
  };
}

function reactionRetryInstruction(error,{lineProtocol=false,requireNotes=false}={}){
  const formatRule=lineProtocol
    ? `Return the compact line protocol exactly: one mandatory P01-P14 numeric weight line for every Prim, then one RANKING line${requireNotes?', then four NOTE lines for ranks 1-4':''}. Do not return JSON.`
    : `Return the required JSON object with all 14 numeric relative weights, a complete strongest-to-weakest ranking with no duplicates, and four non-empty notes for ranks 1-4.`;
  return `\n\nYour previous response was rejected by the Reaction effort/format validator: ${String(error?.message||error||'unknown error').slice(0,500)}\nReassess the whole 14-reaction field from scratch. ${formatRule} Do not perform percentage-total arithmetic.`;
}

async function runReactionAssessment(env,model,image,behavior='analyze',evidence={}){
  let lastError = null;
  const useImage = evidence?.useImage !== false;
  const descriptionContext = String(evidence?.descriptionContext||'').trim();
  const combinedEvidence = useImage && Boolean(descriptionContext);
  const evidenceMode = useImage ? (combinedEvidence ? 'image+description' : 'image') : 'description';
  const requireNotes = evidence?.requireNotes === true;

  // Evidence routing is intentionally mode-specific:
  // - Image only: Llama 3.2 Vision with the documented legacy image field.
  // - Description only: Llama 4 Scout with guided_json and no image bytes.
  // - Image + Description: Llama 4 Scout as a true multimodal chat request, with
  //   text and a data-URI image content part in the same message plus guided_json.
  const reactionModel = combinedEvidence
    ? (env.WORKERS_AI_REACTION_MODEL || DEFAULT_REACTION_MODEL)
    : useImage
      ? (env.WORKERS_AI_REACTION_VISION_MODEL || model || DEFAULT_MODEL)
      : (env.WORKERS_AI_REACTION_MODEL || DEFAULT_REACTION_MODEL);

  for (let attempt=1;attempt<=2;attempt++){
    try{
      const prompt = reactionPrompt(evidence) + (attempt===2 ? reactionRetryInstruction(lastError,{lineProtocol:false,requireNotes}) : '');

      if (combinedEvidence){
        const structured = await runStructured(
          env,reactionModel,image,prompt,reactionSchema(),2300,'guided_json',
          {behavior,reactionEvidenceMode:evidenceMode,multimodalMessages:true,temperature:attempt===1?(behavior==='reanalyze'?0.28:0.08):0}
        );
        return validateReactionAssessment(structured,{requireNotes});
      }

      if (useImage){
        const raw = await runStructured(
          env,reactionModel,image,prompt,null,2600,'text',
          {behavior,reactionEvidenceMode:evidenceMode,temperature:attempt===1?(behavior==='reanalyze'?0.35:0.1):0}
        );
        const parsed = parseReactionText(raw);
        try{
          return validateReactionAssessment(parsed,{requireNotes});
        }catch(error){
          throw diagnosticError(
            error?.message || 'Reaction Vision response could not be validated',
            {
              phase:'reaction-vision-text-parse-or-effort-validation',
              model:reactionModel,
              evidenceMode,
              errorMessage:String(error?.message||error||'unknown').slice(0,1200),
              responsePreview:String(parsed?.rawPreview||raw||'').slice(0,1600)
            }
          );
        }
      }

      const structured = await runStructured(
        env,reactionModel,null,prompt,reactionSchema(),2100,'guided_json',
        {behavior,temperature:attempt===1?(behavior==='reanalyze'?0.35:0.1):0}
      );
      return validateReactionAssessment(structured,{requireNotes});
    }catch(error){
      lastError = error;
      const message = String(error?.message||error);
      const providerFailure = /Workers AI vision failed|timed out after/i.test(message);
      if (attempt>=2 || providerFailure) break;
    }
  }
  const existingDiagnostic = providerDiagnosticOf(lastError);
  if (existingDiagnostic) throw lastError;
  throw diagnosticError(
    lastError?.message || 'Reaction Analysis failed',
    {
      phase:'reaction-parse-or-effort-validation',
      model:reactionModel,
      evidenceMode,
      errorMessage:String(lastError?.message||lastError||'unknown').slice(0,1200)
    }
  );
}

async function runReactionAllocation(env,model,image,behavior='analyze',evidence={}){
  const assessment = await runReactionAssessment(env,model,image,behavior,evidence);
  return allocateReactionPool(assessment);
}

const THEME_SEMANTIC_EVIDENCE_RULES = `SEMANTIC EVIDENCE DISCIPLINE:
- Cue ≠ meaning. The mere presence of an object, color, pose, creature, room state, or other cue is not Theme evidence unless that cue actually carries the Theme's meaning in context.
- Modifiers matter. Do not silently change what a word modifies: visual quantity is not excessive sweetness; generic clutter alone is not sparseness, grime, hoarding, carnival display, or distorted reality; an ordinary pose is not automatically comic, eccentric, helpless, or romantic.
- Do not manufacture evidence from interpretation. A conclusion such as “surreal,” “liminal,” “zany,” “horror,” or “medicated” cannot be recycled as proof of the conditions that supposedly justify it.
- Keep ambiguous cues ambiguous until independent evidence supports a more specific interpretation. Closed eyes can mean rest; a distant gaze can have many causes; a still image can support persistence only through visible accumulated consequences or other concrete evidence.
- Identify the actual semantic route that earns a match. If a broad definition has several routes, name the route supported by the image instead of inventing a different one.
- Confidence must track demonstrated evidence. 100 means exceptionally complete and essentially unmistakable, not merely plausible. A forced top-three choice may legitimately have modest confidence if it is only the closest available Theme.`;

function themePrompt(analysisContext=""){
  // Deliberately expose code + semantic label only.
  // Do NOT expose the P01/P02 provenance of PFM codes to the model:
  // theme classification must remain independent of Reaction Analysis.
  const choices = PRIMFUSION_REGISTRY.aiThemeChoices
    .map(t => `${t.code} — ${t.name}${t.aiMeaning ? ` — Meaning: ${t.aiMeaning}` : ``}`)
    .join('\n');

  const fallbackRule = CUSTOM_THEME_GENERATION_ENABLED
    ? `If an important Theme genuinely is not adequately represented by the current matrix vocabulary, one Custom Theme candidate may be used. A Custom candidate must be a concise reusable semantic Theme name, not a medium/style tag.`
    : `Custom Theme generation is temporarily DISABLED for research. You MUST choose all three selections from the current matrix vocabulary. If the vocabulary is imperfect, choose the three closest valid matrix Themes rather than inventing a fallback. This restriction is intentional so vocabulary weaknesses remain observable.`;

  const formats = CUSTOM_THEME_GENERATION_ENABLED
    ? `1|matrix|<PFM_CODE>|<CONFIDENCE>|Brief image-grounded reason this Theme fits\n2|matrix|<PFM_CODE>|<CONFIDENCE>|Brief image-grounded reason this Theme fits\n3|custom|<PROPOSED_THEME_NAME>|<CONFIDENCE>|Brief image-grounded reason this Theme is needed`
    : `1|matrix|<PFM_CODE>|<CONFIDENCE>|Brief image-grounded reason this Theme fits\n2|matrix|<PFM_CODE>|<CONFIDENCE>|Brief image-grounded reason this Theme fits\n3|matrix|<PFM_CODE>|<CONFIDENCE>|Brief image-grounded reason this Theme fits`;
  const context=String(analysisContext||'').trim().slice(0,6000);
  const failsafe=context ? `\n\nTHEME FAILSAFE CONTEXT:\nUse the existing AI freeform analysis below as additional guidance together with the image. It is a steering input for this rerun; continue judging the Themes from the image as well.\n\n${context}` : '';

  return `You are performing Genreactrix Theme Analysis.

PrimFusion Matrix version: ${matrixVersion()}.

Choose exactly three DIFFERENT Theme selections that best fit the image.
Choose from the current PrimFusion fusion vocabulary below.
Evaluate the semantic meaning of the Theme names from the image itself.
Do not use reaction-analysis scores to make Theme choices.
The codes are identifiers only.

A Theme is a semantic/thematic classification. Do not use a visual medium, production format, or art technique as a Theme merely because it is visible. Those observations belong in the freeform AI Description.

${THEME_SEMANTIC_EVIDENCE_RULES}

The exactly-three rule is mandatory. If fewer than three Themes are strong matches, still return the three closest valid PrimFusion Themes, but lower confidence instead of fabricating evidence or inflating a weak fit.

${fallbackRule}${failsafe}

CURRENT AI-ELIGIBLE PRIMFUSION THEMES:
${choices}

Return exactly three ranked selections, strongest first, and nothing else.
Use one line per selection in this exact pipe-delimited format:
${formats}

For matrix choices, field 3 must be one valid PFM code from the vocabulary above. Standalone Prims are intentionally not eligible AI Theme outputs.
Field 4 is confidence from 0-100.
Field 5 is a concise image-grounded rationale explaining why the Theme was selected.

Do not repeat the same Theme, code, or semantic label under another rank.`;
}

function themeSchema(){
  const validCodes = PRIMFUSION_REGISTRY.aiThemeChoices.map(t=>t.code);
  const matrixChoice = {
    type:'object',
    properties:{
      source:{type:'string',enum:['matrix']},
      code:{type:'string',enum:validCodes},
      confidence:{type:'number',minimum:0,maximum:100}
    },
    required:['source','code','confidence'],
    additionalProperties:false
  };
  const itemSchema = CUSTOM_THEME_GENERATION_ENABLED ? {anyOf:[
    matrixChoice,
    {
      type:'object',
      properties:{
        source:{type:'string',enum:['custom']},
        proposedName:{type:'string'},
        confidence:{type:'number',minimum:0,maximum:100}
      },
      required:['source','proposedName','confidence'],
      additionalProperties:false
    }
  ]} : matrixChoice;
  return {
    type:'object',
    properties:{themes:{type:'array',minItems:3,maxItems:3,items:itemSchema}},
    required:['themes'],
    additionalProperties:false
  };
}

const THEME_RERUN_STATES = new Set(['neutral','replace','preserve']);
const THEME_RERUN_PRIM_STATES = new Set(['mandatory','preferred','optional','discouraged','forbidden']);
const THEME_RERUN_PRIM_WEIGHTS = Object.freeze({mandatory:100,preferred:80,optional:60,discouraged:20,forbidden:0});
const THEME_RERUN_SCOPES = new Set(['theme1','theme2','theme3','general']);

function normalizeThemeRerun(input){
  if(!input||typeof input!=='object')return null;
  const validThemeCodes=new Set(PRIMFUSION_REGISTRY.aiThemeChoices.map(row=>row.code));
  const validPrimCodes=new Set(PRIMFUSION_REGISTRY.primitives.map(row=>row.id));
  const rawSlots=Array.isArray(input.themeSlots)?input.themeSlots:[];
  const themeSlots=[1,2,3].map(slot=>{
    const raw=rawSlots.find(row=>Number(row?.slot)===slot)||{};
    const state=THEME_RERUN_STATES.has(String(raw.state||''))?String(raw.state):'neutral';
    const code=String(raw.currentThemeCode||'').trim().toUpperCase();
    const weight=Number(raw.currentThemeWeight??raw.weight);
    return{slot,state,currentThemeCode:validThemeCodes.has(code)?code:null,currentThemeWeight:Number.isFinite(weight)?Math.max(0,Math.min(100,weight)):null};
  });
  const primPicker=[];
  for(const raw of Array.isArray(input.primPicker)?input.primPicker:[]){
    const scope=String(raw?.scope||'');if(!THEME_RERUN_SCOPES.has(scope)||primPicker.some(row=>row.scope===scope))continue;
    const byPrim=new Map();
    for(const item of Array.isArray(raw?.assignments)?raw.assignments:[]){
      const primCode=String(item?.primCode||'').trim().toUpperCase(),state=String(item?.state||'');
      if(validPrimCodes.has(primCode)&&THEME_RERUN_PRIM_STATES.has(state))byPrim.set(primCode,{primCode,state,weight:THEME_RERUN_PRIM_WEIGHTS[state]});
    }
    const assignments=[...byPrim.values()];
    const unchosenWeight=assignments.some(item=>item.state==='optional')?40:50;
    primPicker.push({scope,assignments,unchosenWeight});
  }
  const excludedThemeCodes=[...new Set((Array.isArray(input.excludedThemeCodes)?input.excludedThemeCodes:[]).map(code=>String(code).trim().toUpperCase()).filter(code=>validThemeCodes.has(code)))];
  const includedDescriptions=[];let remaining=16000;
  for(const raw of Array.isArray(input.includedDescriptions)?input.includedDescriptions:[]){
    if(remaining<=0)break;const text=String(raw?.text||'').trim();if(!text)continue;const clipped=text.slice(0,remaining);remaining-=clipped.length;
    includedDescriptions.push({artifactId:raw?.artifactId?String(raw.artifactId):null,version:Number(raw?.version)||0,createdAt:String(raw?.createdAt||''),text:clipped});
  }
  return{schemaVersion:1,themeSlots,primPicker,excludedThemeCodes,includedDescriptions};
}

function themeRerunScopeForSlot(slotRow){return slotRow.state==='preserve'?null:(slotRow.state==='replace'?`theme${slotRow.slot}`:'general')}
function themeRerunScopeWeights(rerun,scope){
  const primCodes=PRIMFUSION_REGISTRY.primitives.map(row=>row.id),row=rerun.primPicker.find(item=>item.scope===scope)||null;
  const unchosenWeight=row?.assignments?.some(item=>item.state==='optional')?40:50,weights=Object.fromEntries(primCodes.map(code=>[code,unchosenWeight]));
  const states={};for(const item of row?.assignments||[]){weights[item.primCode]=THEME_RERUN_PRIM_WEIGHTS[item.state];states[item.primCode]=item.state;}
  return{weights,states,unchosenWeight,mandatory:Object.keys(states).filter(code=>states[code]==='mandatory'),forbidden:Object.keys(states).filter(code=>states[code]==='forbidden')};
}
function themeRerunCandidateData(rerun,slotRow){
  if(slotRow.state==='preserve')return{scope:null,candidates:[],weights:null};
  if(slotRow.state==='replace'&&!slotRow.currentThemeCode)throw new Error(`Theme ${slotRow.slot} cannot be replaced because its current PFM code is unavailable.`);
  const scope=themeRerunScopeForSlot(slotRow),weightSpec=themeRerunScopeWeights(rerun,scope);
  if(weightSpec.mandatory.length>2)throw new Error(`Theme ${slotRow.slot} PrimPicker has ${weightSpec.mandatory.length} Mandatory Prims. A PrimFusion can contain only two Prims.`);
  const excluded=new Set(rerun.excludedThemeCodes);
  for(const row of rerun.themeSlots)if(row.state==='preserve'&&row.currentThemeCode)excluded.add(row.currentThemeCode);
  if(slotRow.state==='replace'&&slotRow.currentThemeCode)excluded.add(slotRow.currentThemeCode);
  const candidates=PRIMFUSION_REGISTRY.aiThemeChoices.filter(theme=>{
    if(excluded.has(theme.code))return false;
    const primIds=Array.isArray(theme.primIds)?theme.primIds:[];
    if(weightSpec.forbidden.some(code=>primIds.includes(code)))return false;
    if(weightSpec.mandatory.some(code=>!primIds.includes(code)))return false;
    return primIds.length===2;
  }).map(theme=>{
    const [first,second]=theme.primIds,pairWeight=(weightSpec.weights[first]+weightSpec.weights[second])/2;
    return{code:theme.code,name:theme.name,primIds:[first,second],pairWeight:Math.round(pairWeight*10)/10,aiMeaning:String(theme.aiMeaning||'')};
  }).sort((a,b)=>b.pairWeight-a.pairWeight||a.code.localeCompare(b.code));
  if(!candidates.length)throw new Error(`Theme ${slotRow.slot} has no eligible PrimFusion Themes after applying its PrimPicker and Theme Exclusions.`);
  return{scope,candidates,weights:weightSpec};
}
function themeRerunCandidateSets(rerun){
  const protectedCodes=new Set();
  for(const row of rerun.themeSlots){
    if(row.state==='preserve'){
      if(!row.currentThemeCode)throw new Error(`Theme ${row.slot} cannot be preserved because its PFM code is unavailable.`);
      if(rerun.excludedThemeCodes.includes(row.currentThemeCode))throw new Error(`Theme ${row.slot} is both preserved and excluded.`);
      if(protectedCodes.has(row.currentThemeCode))throw new Error('Protected Theme slots must contain different PFM codes.');
      protectedCodes.add(row.currentThemeCode);
    }
  }
  const sets={};
  for(const row of rerun.themeSlots)sets[row.slot]=row.state==='preserve'?{scope:null,candidates:[{code:row.currentThemeCode}],weights:null}:themeRerunCandidateData(rerun,row);
  const slotCodes=[1,2,3].map(slot=>sets[slot].candidates.map(row=>row.code));
  const canAssign=(index,used)=>{if(index===slotCodes.length)return true;for(const code of slotCodes[index])if(!used.has(code)){used.add(code);if(canAssign(index+1,used))return true;used.delete(code);}return false;};
  if(!canAssign(0,new Set()))throw new Error('Theme Rerun constraints cannot produce three different Theme codes. Relax a Mandatory, Forbidden, or Theme Exclusion choice.');
  return sets;
}
function themeRerunPrompt(rerun,sets){
  const unionCodes=new Set();for(const slot of [1,2,3])for(const item of sets[slot].candidates)unionCodes.add(item.code);
  const vocabulary=PRIMFUSION_REGISTRY.aiThemeChoices.filter(row=>unionCodes.has(row.code)).map(row=>`${row.code} — ${row.name}${row.aiMeaning?` — Meaning: ${row.aiMeaning}`:''}`).join('\n');
  const slotBlocks=[];
  for(const row of rerun.themeSlots){
    if(row.state==='preserve'){slotBlocks.push(`THEME ${row.slot}: PRESERVE ${row.currentThemeCode}. This slot is immutable. Do not reassess it and do not output a line for it.`);continue;}
    const data=sets[row.slot],weights=data.weights,weightLine=PRIMFUSION_REGISTRY.primitives.map(p=>`${p.id}=${weights.weights[p.id]}`).join(', '),candidateLine=data.candidates.map(item=>`${item.code}(${item.pairWeight})`).join(', ');
    slotBlocks.push(`THEME ${row.slot}: ${row.state==='replace'?`REPLACE the current ${row.currentThemeCode||'Theme'}. The current code is not eligible for this slot.`:`NEUTRAL. You may keep ${row.currentThemeCode||'the current Theme'} if it remains the best eligible fit.`}\nPrimPicker scope: ${data.scope}. Effective P-code weights: ${weightLine}.\nEligible PFM codes for this slot, with pair preference score in parentheses: ${candidateLine}`);
  }
  const descriptionBlock=rerun.includedDescriptions.length?rerun.includedDescriptions.map((row,index)=>`REFERENCE DESCRIPTION ${index+1}${row.createdAt?` — ${row.createdAt}`:''}${row.version?` — v${row.version}`:''}:\n${row.text}`).join('\n\n'):'No AI Description context was included.';
  const openSlots=rerun.themeSlots.filter(row=>row.state!=='preserve').map(row=>row.slot);
  const outputLines=openSlots.map(slot=>`${slot}|matrix|PFM####|0-100|Brief image-grounded reason`).join('\n');
  return `You are performing a DIRECTOR-GUIDED Genreactrix Theme Rerun.\n\nThe image is always authoritative visual evidence. Reassess every slot that is not PRESERVE. A PRESERVE slot is immutable and is handled locally by Genreactrix.\n\nTheme identity is the PFM code. Human-readable Theme names are semantic labels only. The three final PFM codes MUST be different.\n\n${THEME_SEMANTIC_EVIDENCE_RULES}\n\nPrimPicker rules:\n- Mandatory (100): hard requirement. An eligible PFM for that slot must contain every Mandatory P-code.\n- Preferred (80), Optional (60), Unchosen (40 or 50), and Discouraged (20) are steering weights. Higher pair scores are stronger Director preference, while image fit still matters.\n- Forbidden (0): hard prohibition. A PFM containing a Forbidden P-code is not eligible.\n- Theme Exclusions and a red slot's current PFM are hard prohibitions.\n- Do not use Reaction-analysis scores. PrimPicker values are Director instructions, not Reaction Analysis.\n\n${slotBlocks.join('\n\n')}\n\nINCLUDED AI DESCRIPTION CONTEXT:\n${descriptionBlock}\n\nELIGIBLE THEME SEMANTICS (union of the slot-specific allowed codes):\n${vocabulary}\n\nOUTPUT FORMAT — THIS IS REQUIRED:\nReturn exactly ${openSlots.length} pipe-delimited line${openSlots.length===1?'':'s'}, one for each open Theme slot in ascending slot order.\n${outputLines}\nUse an eligible PFM code for that exact slot. Confidence is 0-100. Rationale must briefly cite visible image evidence.\nDo not return JSON. Do not use Markdown, bullets, headings, commentary, or lines for PRESERVE slots.`;
}
function parseThemeRerunStructured(raw,rerun,sets){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Theme Rerun provider response was not an object.');
  const used=new Set(),selections=[];
  for(const slotRow of rerun.themeSlots){
    const rawRow=raw[`theme${slotRow.slot}`]||{},allowed=new Set(sets[slotRow.slot].candidates.map(item=>item.code));
    const code=slotRow.state==='preserve'?slotRow.currentThemeCode:String(rawRow.code||'').trim().toUpperCase();
    if(!code||!allowed.has(code))throw new Error(`Theme ${slotRow.slot} returned an ineligible PFM code.`);
    if(used.has(code))throw new Error(`Theme Rerun returned duplicate PFM code ${code}.`);used.add(code);
    if(slotRow.state==='preserve')selections.push({rank:slotRow.slot,source:'matrix',code,confidence:slotRow.currentThemeWeight??50,rationale:'Preserved by Director instruction.'});
    else{const confidence=Number(rawRow.confidence),rationale=String(rawRow.rationale||'').trim();if(!Number.isFinite(confidence))throw new Error(`Theme ${slotRow.slot} confidence was invalid.`);if(!rationale)throw new Error(`Theme ${slotRow.slot} rationale was empty.`);selections.push({rank:slotRow.slot,source:'matrix',code,confidence:Math.max(0,Math.min(100,confidence)),rationale});}
  }
  return selections;
}
function parseThemeRerunText(raw,rerun,sets){
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))return parseThemeRerunStructured(raw,rerun,sets);
  const text=String(raw||'').trim();
  if(!text)throw new Error('Theme Rerun provider returned an empty response.');

  // Text mode is authoritative for Theme reruns, but accept a valid JSON object
  // if the model voluntarily emits one despite the requested line protocol.
  try{
    const structured=parse(text);
    if(structured&&typeof structured==='object'&&!Array.isArray(structured))return parseThemeRerunStructured(structured,rerun,sets);
  }catch{}

  const rows=new Map();
  const openSlots=rerun.themeSlots.filter(row=>row.state!=='preserve').map(row=>row.slot);
  const preservedCodes=new Set(rerun.themeSlots.filter(row=>row.state==='preserve').map(row=>row.currentThemeCode).filter(Boolean));
  const allowedBySlot=new Map(openSlots.map(slot=>[slot,new Set(sets[slot].candidates.map(item=>item.code))]));
  const rawLines=text.split(/\r?\n/);

  const confidenceFrom = value => {
    const percent=String(value||'').match(/(?:^|\D)(100|[1-9]?\d(?:\.\d+)?)\s*%/);
    if(percent)return Math.max(0,Math.min(100,Number(percent[1])));
    const bare=String(value||'').match(/(?:^|[|,:;\-–—\s])(100|[1-9]?\d(?:\.\d+)?)(?=$|[|,:;\-–—\s])/);
    return bare?Math.max(0,Math.min(100,Number(bare[1]))):null;
  };
  const slotFrom = value => {
    const v=String(value||'');
    let m=v.match(/\b(?:THEME|SLOT|RANK)\s*#?\s*([123])\b/i);
    if(m)return Number(m[1]);
    m=v.match(/^\s*#?\s*([123])\s*(?:[.)\]:\-–—|]|$)/);
    if(m)return Number(m[1]);
    m=v.match(/\bTHEME\s+(ONE|TWO|THREE)\b/i);
    if(m)return({ONE:1,TWO:2,THREE:3})[m[1].toUpperCase()]||null;
    return null;
  };
  const rationaleFor = (line,code) => {
    const cleaned=String(line||'').replace(/^\s*[-*•]+\s*/,'').trim();
    if(cleaned)return cleaned.slice(0,1000);
    return `Provider response selected ${code}.`;
  };

  // First pass: exact/near-exact pipe formats. Also accept Markdown table rows
  // with a leading/trailing pipe, which the v0.9.6.29 parser rejected.
  for(const line of rawLines){
    const cleaned=line.replace(/^\s*[-*•]+\s*/,'').trim().replace(/^\|\s*/,'').replace(/\s*\|$/,'');
    if(!cleaned||!cleaned.includes('|'))continue;
    const parts=cleaned.split('|').map(part=>part.trim());
    if(parts.length<2)continue;
    const slot=slotFrom(parts[0]);
    if(!openSlots.includes(slot))continue;

    let code=null,confidence=null,rationale='';
    const matrixIndex=parts.findIndex(part=>String(part).toLowerCase()==='matrix');
    const codeIndex=parts.findIndex(part=>/\bPFM\d{4}\b/i.test(part));
    if(codeIndex>=0)code=String(parts[codeIndex].match(/PFM\d{4}/i)[0]).toUpperCase();
    if(!code)continue;
    if(matrixIndex>=0&&codeIndex===matrixIndex+1){
      confidence=confidenceFrom(parts[codeIndex+1]);
      rationale=parts.slice(codeIndex+2).join('|').trim();
    }else{
      confidence=confidenceFrom(parts[codeIndex+1]||cleaned);
      rationale=parts.slice(codeIndex+2).join('|').trim();
    }
    if(confidence==null)confidence=confidenceFrom(cleaned)??70;
    if(!rationale)rationale=rationaleFor(line,code);
    if(allowedBySlot.get(slot)?.has(code)&&!preservedCodes.has(code))rows.set(slot,{code,confidence,rationale});
  }

  // Second pass: tolerate ordinary prose/Markdown such as
  // "Theme 1: PFM0407 — 88% — reason" or "1. **PFM0407** (88%) reason".
  // If a line explicitly names a slot, assign only when that code is eligible
  // for that exact slot.
  const codeOccurrences=[];
  for(let lineIndex=0;lineIndex<rawLines.length;lineIndex++){
    const line=rawLines[lineIndex];
    const re=/\b(PFM\d{4})\b/ig;let m;
    while((m=re.exec(line))){
      const code=m[1].toUpperCase();
      const explicitSlot=slotFrom(line);
      const confidence=confidenceFrom(line)??70;
      const occurrence={code,line,lineIndex,offset:m.index,explicitSlot,confidence,rationale:rationaleFor(line,code)};
      codeOccurrences.push(occurrence);
      if(explicitSlot&&openSlots.includes(explicitSlot)&&!rows.has(explicitSlot)&&allowedBySlot.get(explicitSlot)?.has(code)&&!preservedCodes.has(code)){
        rows.set(explicitSlot,{code,confidence,rationale:occurrence.rationale});
      }
    }
  }

  // Third pass: if the model supplied PFM codes but omitted usable slot labels,
  // assign the remaining unique codes to remaining open slots in response order.
  // A tiny backtracking match preserves slot-specific eligibility for future
  // mixed Green/Red/Neutral reruns instead of blindly treating order as truth.
  const usedCodes=new Set([...preservedCodes,...[...rows.values()].map(row=>row.code)]);
  const remainingSlots=openSlots.filter(slot=>!rows.has(slot));
  const pool=[];
  for(const occ of codeOccurrences){
    if(usedCodes.has(occ.code)||pool.some(item=>item.code===occ.code))continue;
    pool.push(occ);
  }
  const assignment=new Map();
  const assign=(index,used)=>{
    if(index>=remainingSlots.length)return true;
    const slot=remainingSlots[index];
    for(let i=0;i<pool.length;i++){
      const occ=pool[i];
      if(used.has(occ.code)||!allowedBySlot.get(slot)?.has(occ.code))continue;
      // An explicit label for a different open slot is strong evidence and
      // should not be silently reassigned here.
      if(occ.explicitSlot&&occ.explicitSlot!==slot)continue;
      used.add(occ.code);assignment.set(slot,occ);
      if(assign(index+1,used))return true;
      assignment.delete(slot);used.delete(occ.code);
    }
    return false;
  };
  assign(0,new Set(usedCodes));
  for(const [slot,occ] of assignment)rows.set(slot,{code:occ.code,confidence:occ.confidence,rationale:occ.rationale});

  const structured={};
  for(const slotRow of rerun.themeSlots){
    if(slotRow.state==='preserve')structured[`theme${slotRow.slot}`]={code:slotRow.currentThemeCode};
    else{
      const row=rows.get(slotRow.slot);
      if(!row){
        const preview=text.replace(/\s+/g,' ').slice(0,500);
        throw new Error(`Theme ${slotRow.slot} was missing from the Theme Rerun response.${preview?` Provider preview: ${preview}`:''}`);
      }
      structured[`theme${slotRow.slot}`]=row;
    }
  }
  return parseThemeRerunStructured(structured,rerun,sets);
}
async function runThemeRerun(env,model,image,behavior,input){
  const rerun=normalizeThemeRerun(input);if(!rerun)throw new Error('Theme Rerun request was missing.');
  const sets=themeRerunCandidateSets(rerun),basePrompt=themeRerunPrompt(rerun,sets),openSlots=rerun.themeSlots.filter(row=>row.state!=='preserve');
  if(!openSlots.length){
    const local={};for(const row of rerun.themeSlots)local[`theme${row.slot}`]={code:row.currentThemeCode};
    return{rerun,sets,selections:parseThemeRerunStructured(local,rerun,sets)};
  }
  let lastError=null;
  for(let attempt=1;attempt<=3;attempt++){
    const recovery=attempt===1?'':`\n\nRECOVERY: The prior response could not be accepted${lastError?.message?`: ${String(lastError.message).slice(0,300)}`:''}. Return only the exact established Theme Analysis pipe-delimited line format requested for each open Theme slot. Use an eligible PFM code for that slot, keep all final codes unique, and obey every REPLACE, PrimPicker, and Theme Exclusion constraint.`;
    const raw=await runStructured(env,model,image,basePrompt+recovery,null,1600,'text',{behavior,themeRerun:true,temperature:attempt===1?0.18:0.05});
    try{return{rerun,sets,selections:parseThemeRerunText(raw,rerun,sets)};}catch(error){
      lastError=diagnosticError(
        error?.message||'Theme Rerun text response could not be parsed.',
        {phase:'theme-rerun-text-parse',attempt,responsePreview:String(raw||'').slice(0,1200)}
      );
    }
  }
  throw lastError||new Error('Theme Rerun did not produce a valid result.');
}

function normalizeDescriptionRerun(input){
  if(!input||typeof input!=='object')return null;
  const operation=['all','add','replace'].includes(String(input.operation||''))?String(input.operation):'all';
  const themes=Array.isArray(input.themes)?input.themes.slice(0,6).map(row=>({source:String(row?.source||''),slot:Number(row?.slot)||0,label:String(row?.label||''),weight:Number.isFinite(Number(row?.weight))?Number(row.weight):null})).filter(row=>row.label):[];
  const includedDescriptions=Array.isArray(input.includedDescriptions)?input.includedDescriptions.map(row=>({artifactId:row?.artifactId?String(row.artifactId):null,version:Number(row?.version)||0,createdAt:String(row?.createdAt||''),label:String(row?.label||''),text:String(row?.text||'')})).filter(row=>row.text.trim()):[];
  let targetDescription=null;
  if(input.targetDescription&&typeof input.targetDescription==='object'){
    const text=String(input.targetDescription.text||''),start=Math.max(0,Math.min(text.length,Number(input.targetDescription.start)||0)),end=Math.max(start,Math.min(text.length,Number(input.targetDescription.end)||0));
    targetDescription={artifactId:input.targetDescription.artifactId?String(input.targetDescription.artifactId):null,version:Number(input.targetDescription.version)||0,createdAt:String(input.targetDescription.createdAt||''),label:String(input.targetDescription.label||''),text,start,end,selectedText:String(input.targetDescription.selectedText||text.slice(start,end))};
  }
  return{schemaVersion:1,operation,themes,includedDescriptions,targetDescription};
}

function descriptionPrompt(directorGuidance="",descriptionRerun=null){
  const guidance=String(directorGuidance||'').trim().slice(0,6000),rerun=normalizeDescriptionRerun(descriptionRerun);
  const guidanceBlock=guidance ? `\n\nDIRECTOR GUIDANCE:\n${guidance}` : '';
  let contextBlock='';
  if(rerun){
    const themeBlock=rerun.themes.length?rerun.themes.map(row=>`- ${row.source} Theme ${row.slot}: ${row.label}${row.weight!=null?` (${row.weight}%)`:''}`).join('\n'):'No Themes were selected for context.';
    const descriptionsBlock=rerun.includedDescriptions.length?rerun.includedDescriptions.map((row,index)=>`REFERENCE DESCRIPTION ${index+1} — ${row.label||row.createdAt||'undated'}${row.version?` — v${row.version}`:''}:\n${row.text}`).join('\n\n'):'No historical Descriptions were selected for reference context.';
    let operationBlock='';
    if(rerun.operation==='add'){
      const target=rerun.targetDescription;if(!target||!target.text.trim())throw new Error('Description Add rerun requires a populated target Description');
      operationBlock=`OPERATION: ADD AT CURSOR.\nThe target Description is shown below with ⟦CURSOR⟧ at the exact insertion point. Return ONLY the new prose fragment that should be inserted there. Do not repeat the existing prefix or suffix, do not rewrite surrounding text, and do not add commentary about the edit.\n\nTARGET DESCRIPTION:\n${target.text.slice(0,target.start)}⟦CURSOR⟧${target.text.slice(target.start)}`;
    }else if(rerun.operation==='replace'){
      const target=rerun.targetDescription;if(!target||!target.text.trim()||target.end<=target.start)throw new Error('Description Replace rerun requires a highlighted target span');
      operationBlock=`OPERATION: REPLACE HIGHLIGHTED SECTION.\nThe target Description is shown below with the exact editable span marked. Return ONLY replacement prose for the highlighted span. Everything outside the markers is immutable and will be preserved locally by Genreactrix. Do not repeat unchanged surrounding text and do not explain the edit.\n\nTARGET DESCRIPTION:\n${target.text.slice(0,target.start)}⟦HIGHLIGHT START⟧${target.text.slice(target.start,target.end)}⟦HIGHLIGHT END⟧${target.text.slice(target.end)}`;
    }else{
      operationBlock='OPERATION: REWRITE ALL. Return a complete new AI Description of the image. Historical Descriptions, if selected, are reference context only; use, revise, or discard their observations according to what the image actually supports.';
    }
    contextBlock=`\n\nGENREACTRIX RERUN WORKSPACE CONTEXT:\n${operationBlock}\n\nSELECTED THEME CONTEXT:\n${themeBlock}\n\nSELECTED DESCRIPTION CONTEXT:\n${descriptionsBlock}`;
  }
  const outputRule=rerun?.operation==='add'?'Return only the insertion fragment as plain prose.':rerun?.operation==='replace'?'Return only the replacement fragment as plain prose.':'Return the complete freeform analysis directly as prose.';
  return `You are performing Genreactrix Freeform AI Description Analysis.

Study the image closely and provide a robust, substantial visual analysis rather than a short caption.
Be curious and observant. Discuss whatever is materially useful or revealing about the image without forcing the analysis into a fixed checklist.
You may address subjects, objects, actions, setting, composition, medium or style, visible text, relationships, visual jokes, unusual juxtapositions, mood, tone, possible themes, symbolism, ambiguity, implied action, anomalies, or other grounded observations when relevant.

Do not artificially limit the analysis to predefined categories.
Do not invent hidden identity, biography, or facts that cannot reasonably be supported by the image.
When moving beyond direct observation into interpretation, phrase it as interpretation rather than certainty.${contextBlock}${guidanceBlock}

${outputRule} Do not wrap the answer in JSON, Markdown code fences, or a field label.`;
}

function descriptionSchema(){
  return {
    type:'object',
    properties:{description:{type:'string'}},
    required:['description'],
    additionalProperties:false
  };
}

async function runStructured(env, model, image, prompt, schema, maxTokens=2600, responseMode='json_schema', options={}){
  let payload;
  const behavior = options.behavior === 'reanalyze' ? 'reanalyze' : 'analyze';
  const freshRerun = behavior === 'reanalyze'
    ? (options.scopedEdit
      ? ' This is a rerun. Reassess the visual evidence, but obey the exact scoped edit boundary: return only the requested insertion or replacement fragment and leave all other target text to Genreactrix.'
      : options.themeRerun
        ? ' This is a fresh Theme rerun. Reassess only the slots that are open to change, obey Director constraints exactly, and copy every preserved slot unchanged.'
        : options.reactionEvidenceMode === 'image+description'
          ? ' This is a fresh Reaction rerun. Reassess the image and supplied AI Description together as the two selected evidence sources. Do not mechanically reproduce a prior plausible answer; reconsider the relative evidence from both sources.'
          : ' This is a fresh rerun. Reassess the image independently from scratch. Do not mechanically reproduce a prior plausible answer; reconsider the relative evidence while remaining faithful to what is visible.')
    : '';
  const temperature = Number.isFinite(options.temperature)
    ? options.temperature
    : (behavior === 'reanalyze' ? 0.35 : 0.1);
  const providerCallTimeoutMs = Number.isFinite(options.providerCallTimeoutMs)
    ? Math.max(1000, options.providerCallTimeoutMs)
    : PROVIDER_CALL_TIMEOUT_MS;

  try{
    const fullPrompt=prompt + freshRerun;
    const multimodalMessages=options.multimodalMessages===true;
    const request = multimodalMessages
      ? {
          messages:[{
            role:'user',
            content:[
              {type:'text',text:fullPrompt},
              {type:'image_url',image_url:{url:imageBytesDataUrl(image)}}
            ]
          }],
          max_tokens:maxTokens,
          temperature
        }
      : {
          prompt:fullPrompt,
          max_tokens:maxTokens,
          temperature
        };
    if (!multimodalMessages && image && (image.byteLength || image.length)) request.image = image;
    if (responseMode === 'guided_json') {
      // Cloudflare Workers AI binding parameter: schema-guided JSON generation.
      request.guided_json = schema;
    } else if (responseMode === 'json_schema') {
      request.response_format = {type:'json_schema',json_schema:schema};
    } else if (responseMode === 'json_object') {
      request.response_format = {type:'json_object'};
    }

    payload = await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error(`Provider call timed out after ${Math.round(providerCallTimeoutMs/1000)}s`)),providerCallTimeoutMs);
      Promise.resolve(env.AI.run(model,request)).then(
        value=>{clearTimeout(timer);resolve(value)},
        error=>{clearTimeout(timer);reject(error)}
      );
    });
  }catch(error){
    throw diagnosticError(
      `Workers AI vision failed: ${error?.message||error}`,
      {
        phase:'provider-call',
        errorName:error?.name || null,
        errorMessage:String(error?.message || error).slice(0,1200)
      }
    );
  }

  const value = responseValue(payload);
  if (value === '' || value == null) {
    throw diagnosticError(
      'Workers AI returned no analysis response',
      safeProviderDiagnostic(payload)
    );
  }

  if (responseMode === 'text') {
    if (typeof value === 'string') return options.preserveWhitespace ? value : value.trim();
    if (value && typeof value === 'object') return JSON.stringify(value);
    const text=String(value);
    return options.preserveWhitespace ? text : text.trim();
  }

  return parseProviderResponse(payload);
}

function promptDiagnosticTransientProviderError(error){
  const diagnostic=providerDiagnosticOf(error)||{};
  if(diagnostic.transientProviderFailure===true)return true;
  const providerPhase=String(diagnostic.providerPhase||diagnostic.phase||'');
  if(providerPhase!=='provider-call')return false;
  const status=Number(diagnostic.errorStatus??diagnostic.status??0);
  if([429,500,502,503,504].includes(status))return true;
  const text=`${error?.message||''} ${diagnostic.errorMessage||''}`.toLowerCase();
  return /timed out|timeout|temporar|overload|unavailable|try again|rate limit|too many requests|network|failed to fetch|connection/.test(text);
}

function promptDiagnosticProviderFailureKind(error){
  const diagnostic=providerDiagnosticOf(error)||{};
  const text=`${error?.message||''} ${diagnostic.errorMessage||''}`.toLowerCase();
  if(/timed out|timeout/.test(text))return'timeout';
  if(/rate limit|too many requests|429/.test(text))return'rate-limit';
  if(/overload|unavailable|temporar|502|503|504/.test(text))return'unavailable';
  return'provider-transient';
}

function promptDiagnosticRecoveryEvent(recoveryLog,event){
  if(!Array.isArray(recoveryLog))return;
  recoveryLog.push({at:new Date().toISOString(),...event});
}

async function runPromptDiagnosticStructured(env,model,image,prompt,schema,maxTokens,responseMode,options={},meta={}){
  const maxProviderAttempts=Math.max(1,Math.min(3,Number(meta.maxProviderAttempts)||2));
  let lastError=null;
  for(let providerAttempt=1;providerAttempt<=maxProviderAttempts;providerAttempt++){
    try{
      const value=await runStructured(env,model,image,prompt,schema,maxTokens,responseMode,options);
      if(providerAttempt>1){
        promptDiagnosticRecoveryEvent(meta.recoveryLog,{
          type:'provider-recovered',failureKind:promptDiagnosticProviderFailureKind(lastError),
          stage:meta.stage||null,conceptCode:meta.conceptCode||null,componentIds:meta.componentIds||null,
          batchIndex:meta.callContext?.batchIndex??null,callMode:meta.callContext?.callMode??null,waveIndex:meta.callContext?.waveIndex??null,
          providerAttempts:providerAttempt
        });
      }
      return value;
    }catch(error){
      if(!promptDiagnosticTransientProviderError(error))throw error;
      lastError=error;
      promptDiagnosticRecoveryEvent(meta.recoveryLog,{
        type:providerAttempt<maxProviderAttempts?'provider-retry':'provider-retries-exhausted',
        failureKind:promptDiagnosticProviderFailureKind(error),stage:meta.stage||null,conceptCode:meta.conceptCode||null,componentIds:meta.componentIds||null,
        batchIndex:meta.callContext?.batchIndex??null,callMode:meta.callContext?.callMode??null,waveIndex:meta.callContext?.waveIndex??null,
        providerAttempt,maxProviderAttempts
      });
      if(providerAttempt<maxProviderAttempts)continue;
      const inner=providerDiagnosticOf(error)||{};
      throw diagnosticError(
        error?.message||'Prompt Diagnostics provider call failed after automatic retries',
        {
          phase:'prompt-diagnostics-provider-retry-exhausted',providerPhase:inner.phase||'provider-call',
          transientProviderFailure:true,failureKind:promptDiagnosticProviderFailureKind(error),
          batchIndex:meta.callContext?.batchIndex??null,batchNumber:meta.callContext?.batchNumber??null,
          callMode:meta.callContext?.callMode??null,waveIndex:meta.callContext?.waveIndex??null,waveNumber:meta.callContext?.waveNumber??null,
          stage:meta.stage||null,conceptCode:meta.conceptCode||null,componentIds:meta.componentIds||null,
          providerAttempts:maxProviderAttempts,errorName:inner.errorName||error?.name||null,errorMessage:inner.errorMessage||String(error?.message||error).slice(0,1200)
        }
      );
    }
  }
  throw lastError||new Error('Prompt Diagnostics provider call failed');
}

const PROMPT_DIAGNOSTIC_BATCH_SIZE = 15;
const PROMPT_DIAGNOSTIC_BATCH_COUNT = 7;
const PROMPT_DIAGNOSTIC_FIVE_WAVE_SIZE = 5;
const PROMPT_DIAGNOSTIC_THREE_WAVE_SIZE = 3;
const PROMPT_DIAGNOSTIC_COMPONENT_CHUNK_SIZE = 5;

function promptDiagnosticDefinitionParts(definition){
  const text=String(definition||'').trim();
  if(!text)return[];
  const parts=[];
  for(const paragraph of text.split(/\n+/).map(v=>v.trim()).filter(Boolean)){
    const sentences=paragraph.split(/(?<=[.!?])\s+/).map(v=>v.trim()).filter(Boolean);
    for(const sentence of sentences){
      const clauses=sentence.split(/;\s+/).map(v=>v.trim()).filter(Boolean);
      for(const clause of clauses)parts.push(clause);
    }
  }
  return parts.length?parts:[text];
}

function promptDiagnosticVocabulary(){
  const prims=PRIMFUSION_REGISTRY.primitives.map(row=>({
    code:row.id,name:row.name,kind:'prim',symbol:row.symbol||'',primIds:[row.id],definition:String(row.aiMeaning||'')
  }));
  const themes=PRIMFUSION_REGISTRY.aiThemeChoices.map(row=>({
    code:row.code,name:row.name,kind:'fusion',symbol:'',primIds:Array.isArray(row.primIds)?[...row.primIds]:[],definition:String(row.aiMeaning||'')
  }));
  const batches=[];
  for(let batchIndex=0;batchIndex<PROMPT_DIAGNOSTIC_BATCH_COUNT;batchIndex++){
    const primSlice=prims.slice(batchIndex*2,batchIndex*2+2);
    const themeSlice=themes.slice(batchIndex*13,batchIndex*13+13);
    batches.push([...primSlice,...themeSlice].map((row,index)=>({
      ...row,
      batchIndex,
      position:index+1,
      definitionParts:promptDiagnosticDefinitionParts(row.definition)
    })));
  }
  if(batches.length!==7||batches.some(batch=>batch.length!==15))throw new Error('Prompt Diagnostics vocabulary must resolve to seven 15-concept batches');
  return batches;
}

const PROMPT_DIAGNOSTIC_BATCHES = promptDiagnosticVocabulary();

function normalizePromptDiagnosticSources(input){
  const sources={
    image:Boolean(input?.image),
    reactions:Boolean(input?.reactions),
    description:Boolean(input?.description)
  };
  if(!sources.image&&!sources.reactions&&!sources.description)throw new Error('Prompt Diagnostics requires at least one evidence source');
  return sources;
}

function normalizePromptDiagnosticReactionScores(raw){
  const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  const out={};
  for(const prim of PRIMFUSION_REGISTRY.primitives){
    const value=source[prim.id];
    const n=typeof value==='number'?value:Number(value?.percentage??value?.confidence??value?.score??value?.weight??value?.value??value);
    out[prim.id]=Number.isFinite(n)?Math.max(0,Math.min(100,n)):0;
  }
  return out;
}

function promptDiagnosticSourceLabel(sources){
  return ['image','reactions','description'].filter(key=>sources[key]).join('+');
}

function promptDiagnosticCallSpec(body){
  const batchIndex=Number(body?.batchIndex);
  if(!Number.isInteger(batchIndex)||batchIndex<0||batchIndex>=PROMPT_DIAGNOSTIC_BATCH_COUNT)throw new Error('Prompt Diagnostics batchIndex must be 0-6');
  const requested=String(body?.callMode||'fifteen').trim().toLowerCase();
  const callMode=['fifteen','five','three'].includes(requested)?requested:'fifteen';
  const batch=PROMPT_DIAGNOSTIC_BATCHES[batchIndex];
  if(callMode==='fifteen')return{batchIndex,callMode,waveIndex:null,waveNumber:null,waveCount:1,conceptOffset:0,concepts:batch};
  const waveSize=callMode==='three'?PROMPT_DIAGNOSTIC_THREE_WAVE_SIZE:PROMPT_DIAGNOSTIC_FIVE_WAVE_SIZE;
  const waveCount=callMode==='three'?5:3;
  const waveIndex=Number(body?.waveIndex);
  if(!Number.isInteger(waveIndex)||waveIndex<0||waveIndex>=waveCount)throw new Error(`Prompt Diagnostics ${waveSize}-concept waveIndex must be 0-${waveCount-1}`);
  const conceptOffset=waveIndex*waveSize;
  const concepts=batch.slice(conceptOffset,conceptOffset+waveSize);
  if(concepts.length!==waveSize)throw new Error(`Prompt Diagnostics ${waveSize}-concept wave did not resolve to exactly ${waveSize} concepts`);
  return{batchIndex,callMode,waveIndex,waveNumber:waveIndex+1,waveCount,conceptOffset,concepts};
}

function promptDiagnosticEvidence({sources,reactions,description}){
  const sourceLabel=promptDiagnosticSourceLabel(sources);
  const evidence=[];
  if(sources.image)evidence.push('IMAGE: The supplied image is evidence. Judge only what can reasonably be seen or inferred from it.');
  if(sources.reactions){
    const reactionLines=PRIMFUSION_REGISTRY.primitives.map(p=>`${p.id} ${p.name}: ${Math.round((reactions[p.id]||0)*10)/10}%`).join('\n');
    evidence.push(`CURRENT REACTION EVIDENCE: Treat these as supplied reaction measurements, not as ground truth and not as Theme selections.\n${reactionLines}`);
  }
  if(sources.description)evidence.push(`CURRENT AI DESCRIPTION: Treat this as supplied observational/interpretive evidence, not as ground truth and not as a Theme selection.\n${description}`);
  return{sourceLabel,evidenceText:evidence.join('\n\n')};
}

function promptDiagnosticPartId(code,index){
  return `${code}.${String(index+1).padStart(2,'0')}`;
}

function promptDiagnosticConceptBlock(row){
  const numbered=row.definitionParts.map((part,index)=>`  ${promptDiagnosticPartId(row.code,index)} :: ${part}`).join('\n');
  return `CONCEPT ${row.code} — ${row.name} — ${row.kind==='prim'?'PRIM BUILDING BLOCK (diagnostic only; not selectable as a final Theme)':'PRIMFUSION THEME'}\nCURRENT WORKER DEFINITION (verbatim):\n${row.definition}\nDEFINITION COMPONENTS TO ASSESS ONE BY ONE:\n${numbered}`;
}

function promptDiagnosticRequiredRecords(concepts){
  return concepts.map(row=>{
    const parts=row.definitionParts.map((_,index)=>`${promptDiagnosticPartId(row.code,index)} <ASSESSMENT> - <reason>`).join('\n');
    return `${row.code} SCORE <0-100>\n${parts}\n${row.code} WHY - <overall score reason>`;
  }).join('\n');
}

function promptDiagnosticPrompt({callSpec,sources,reactions,description}){
  const {concepts:batch,callMode,waveNumber}=callSpec;
  const {sourceLabel,evidenceText}=promptDiagnosticEvidence({sources,reactions,description});
  const concepts=batch.map(promptDiagnosticConceptBlock).join('\n\n');
  const callLabel=callMode==='five'?`5-concept wave ${waveNumber} of 3 within this 15-concept batch`:callMode==='three'?`3-concept wave ${waveNumber} of 5 within this 15-concept batch`:'15 concepts at once';
  const count=batch.length;
  return `You are running GENREACTRIX PROMPT DIAGNOSTICS. This is research instrumentation, not normal Theme selection.

DIAGNOSTIC CALL FORMAT: ${callLabel}
EVIDENCE SOURCE COMBINATION: ${sourceLabel}
${evidenceText}

Evaluate EACH of the ${count} concepts below INDEPENDENTLY against the available evidence and against its exact current Worker definition.

SCORING RULES:
- Give every concept its own 0-100 MATCH CONFIDENCE. These scores are independent. They do NOT add to 100, are NOT shares of a pool, and must NOT be normalized against one another.
- Do NOT choose three winners. Do NOT rank concepts as a substitute for scoring them.
- Base the score on the supplied definition. The purpose is to discover what the AI sees, does not see, understands, misunderstands, or fails to associate with the definition.
- Assess EVERY explicitly identified definition component for EVERY concept. Do not collapse the definition into one generalized judgment.
- A 0% score requires the same complete component-by-component analysis as a high score.
- Confidence calibration: 0 = no meaningful positive support or a hard gate makes the concept inapplicable; 1-19 = trace/tenuous; 20-39 = weak but real; 40-59 = moderate/mixed; 60-79 = strong; 80-94 = very strong/direct; 95-100 = exceptionally complete/unmistakable. 100 requires essentially no meaningful doubt. 0 requires essentially no positive match evidence unless a hard gate overrides it.
- Genuine positive supporting evidence should normally move the score above 0. Missing, ambiguous, or contradictory evidence should explain why a score is below 100.
- High confidence must be justified by concrete component-level support. Do not inflate confidence because a concept is merely plausible.
- For PrimFusion Themes, judge the fusion Theme's own supplied definition; do not automatically infer it from its two Prims.
- Standalone Prims are diagnostic building blocks only and cannot become final Genreactrix Themes.
- If an evidence source is silent on something, say so. Do not invent missing evidence.
- Cue ≠ meaning. Do not promote an ordinary cue into a more specific semantic claim without independent evidence.
- Do not infer dirt from clutter, hoarding from generic mess, clinical setting from ordinary room objects, romance from a gaze, supernatural danger from an inactive object, distorted reality from confusion, or performance/spectacle from mere oddness.
- The component findings, numeric score, and final WHY must agree. Do not give a high score and then say there is no evidence, insufficient information, or that the concept is unsupported.
- Evaluate only the target concept. Do not compare it to or explain it through unrelated concepts in the same call.
- When a concept matches through one specific route in a broad definition, identify that actual route in the reason.

For each definition component use exactly one assessment label:
- MATCH_EVIDENCE = positive evidence that raises confidence in the concept.
- GATE_CONFIRMED = a limiting/non-qualifier rule is correctly recognized; this validates the gate but does not itself raise match confidence.
- PARTIAL = some but incomplete/ambiguous positive support.
- ABSENT = the component's positive evidence is not present.
- CONTRADICTS = evidence points against the component/concept.
- NOT_OBSERVABLE = the available evidence cannot establish it.
Legacy SUPPORTS is accepted by the Worker as MATCH_EVIDENCE, but prefer the labels above.

OUTPUT: plain text only. Markdown decoration is unnecessary. The Worker accepts minor punctuation variation, but EVERY required record identifier below must be present so each judgment can be tied to the exact definition component.
Use this shape:
P01 SCORE 72
P01.01 MATCH_EVIDENCE - concrete evidence-grounded reason
P01 WHY - explanation of why the component findings justify the final score

Do not substitute a paragraph such as "Definition / Evidence / Score" for the numbered component records.
Do not skip numbered components even at 0%.

${THEME_SEMANTIC_EVIDENCE_RULES}

REQUIRED RECORDS TO COMPLETE:
${promptDiagnosticRequiredRecords(batch)}

${count} CONCEPTS:
${concepts}`;
}

function cleanPromptDiagnosticLine(rawLine){
  return String(rawLine||'')
    .trim()
    .replace(/^[-*•]+\s*/,'')
    .replace(/\*\*/g,'')
    .replace(/`/g,'')
    .trim();
}

function promptDiagnosticCanonicalAssessment(raw){
  const value=String(raw||'').trim().toUpperCase().replace(/[\s-]+/g,'_');
  if(value==='SUPPORTS'||value==='MATCH_EVIDENCE')return'MATCH_EVIDENCE';
  if(value==='GATE_CONFIRMED'||value==='EXCLUSION_CONFIRMED'||value==='EXCLUSION_GATE_CONFIRMED')return'GATE_CONFIRMED';
  if(value==='PARTIAL')return'PARTIAL';
  if(value==='ABSENT')return'ABSENT';
  if(value==='CONTRADICTS')return'CONTRADICTS';
  if(value==='NOT_OBSERVABLE')return'NOT_OBSERVABLE';
  return value;
}

function promptDiagnosticEmptyState(expected){
  const state=new Map();
  for(const concept of expected)state.set(concept.code,{score:null,why:'',parts:new Map()});
  return state;
}

function parsePromptDiagnosticPartial(raw,expected){
  const text=String(raw||'').replace(/```(?:text)?/gi,'').replace(/```/g,'').trim();
  const expectedCodes=new Set(expected.map(c=>c.code));
  const state=promptDiagnosticEmptyState(expected);
  const singleExpectedCode=expected.length===1?expected[0].code:null;
  let currentCode=null;
  let pendingPart=null;
  let pendingPartHeading=null;
  let pendingWhy=null;
  const assessmentPattern='MATCH[_ -]?EVIDENCE|GATE[_ -]?CONFIRMED|EXCLUSION(?:[_ -]?GATE)?[_ -]?CONFIRMED|SUPPORTS|PARTIAL|ABSENT|CONTRADICTS|NOT[_ -]?OBSERVABLE';

  const setScore=(code,value)=>{
    code=String(code||'').toUpperCase();
    if(!expectedCodes.has(code))return;
    const n=Number(value);
    if(Number.isFinite(n)&&n>=0&&n<=100&&state.get(code).score==null)state.get(code).score=n;
  };
  const setWhy=(code,reason)=>{
    code=String(code||'').toUpperCase();
    reason=String(reason||'').trim().replace(/^[-–—:|\s]+/,'');
    if(expectedCodes.has(code)&&reason&&!state.get(code).why)state.get(code).why=reason;
  };
  const setPart=(code,part,assessment,reason)=>{
    code=String(code||'').toUpperCase();
    part=Number(part);assessment=promptDiagnosticCanonicalAssessment(assessment);reason=String(reason||'').trim().replace(/^[-–—:|\s]+/,'').replace(/^REASON\s*[:=\-–—]\s*/i,'');
    if(!expectedCodes.has(code)||!Number.isInteger(part)||part<1||!reason)return;
    if(!['MATCH_EVIDENCE','GATE_CONFIRMED','PARTIAL','ABSENT','CONTRADICTS','NOT_OBSERVABLE'].includes(assessment))return;
    const concept=expected.find(c=>c.code===code);
    if(!concept||part>concept.definitionParts.length)return;
    if(!state.get(code).parts.has(part))state.get(code).parts.set(part,{part,assessment,reason});
  };

  for(const rawLine of text.split(/\r?\n/)){
    const line=cleanPromptDiagnosticLine(rawLine);
    if(!line)continue;

    // Some focused/component-chunk repairs put the known component heading on
    // one line, then emit ASSESSMENT and REASON as separate structured lines:
    // P01.07 :: round cheeks or face
    // ASSESSMENT: PARTIAL
    // REASON: <reason>
    // Keep the exact expected component pending only long enough to attach the
    // immediately following structured assessment. No assessment is inferred
    // from the heading text itself, and the state is discarded on any other
    // substantive line so it cannot bleed across components.
    if(pendingPartHeading){
      const assessmentOnly=line.match(new RegExp(`^ASSESSMENT\\s*(?:\\||::|[:=\\-–—])\\s*(${assessmentPattern})\\s*$`,'i'));
      if(assessmentOnly){
        pendingPart={code:pendingPartHeading.code,part:pendingPartHeading.part,assessment:assessmentOnly[1]};
        currentCode=pendingPartHeading.code;
        pendingPartHeading=null;
        continue;
      }
      pendingPartHeading=null;
    }

    // Some provider repairs echo the template marker and put the real label at
    // the end of the component line, then place the reason on the next line:
    // P03.02 <ASSESSMENT> - ABSENT
    // <reason>
    // Preserve the valid label and consume the following prose line as its reason.
    if(pendingPart){
      const startsNewRecord=/^(?:(?:P\d{2}|PFM\d{4})(?:\.\d{1,2}\b|\s*(?:\||[-–—:]?\s*)(?:SCORE|WHY)\b)|(?:SCORE|WHY)\b|PART\s*\|)/i.test(line);
      if(!startsNewRecord){
        setPart(pendingPart.code,pendingPart.part,pendingPart.assessment,line);
        pendingPart=null;
        continue;
      }
      pendingPart=null;
    }

    // Focused final-score repairs are unambiguously scoped to one concept, but
    // providers sometimes return a Markdown/bare WHY label on one line and put
    // the actual reason on the next line, e.g. "**WHY:**" then prose. Preserve
    // that reason instead of falsely declaring CODE WHY missing. Unqualified WHY
    // remains disallowed for multi-concept responses.
    if(pendingWhy){
      const startsNewRecord=/^(?:(?:P\d{2}|PFM\d{4})(?:\.\d{1,2}\b|\s*(?:\||[-–—:]?\s*)(?:SCORE|WHY)\b)|(?:SCORE|WHY)\b|PART\s*\|)/i.test(line);
      if(!startsNewRecord){
        setWhy(pendingWhy,line);
        pendingWhy=null;
        continue;
      }
      pendingWhy=null;
    }

    let m=line.match(/^(?:#{1,6}\s*)?(?:CONCEPT\s+)?(P\d{2}|PFM\d{4})(?:\s*[-–—:]\s*|\s+)(?:[A-Za-z].*)?$/i);
    if(m&&expectedCodes.has(m[1].toUpperCase()))currentCode=m[1].toUpperCase();

    m=line.match(/^SCORE\s*\|\s*(P\d{2}|PFM\d{4})\s*\|\s*(-?\d+(?:\.\d+)?)\s*%?(?:\s*[-–—:]\s*(.+))?\s*$/i);
    if(m){setScore(m[1],m[2]);if(m[3])setWhy(m[1],m[3]);continue;}
    m=line.match(/^(P\d{2}|PFM\d{4})\s*(?:\||[-–—:]?\s*)SCORE\s*(?:\||[:=\-–—]?\s*)*(-?\d+(?:\.\d+)?)\s*%?(?:\s*[-–—:]\s*(.+))?\s*$/i);
    if(m){setScore(m[1],m[2]);if(m[3])setWhy(m[1],m[3]);currentCode=m[1].toUpperCase();continue;}
    m=line.match(/^SCORE\s+(?:FOR\s+)?(P\d{2}|PFM\d{4})\s*[:=\-–—]?\s*(-?\d+(?:\.\d+)?)\s*%?(?:\s*[-–—:]\s*(.+))?\s*$/i);
    if(m){setScore(m[1],m[2]);if(m[3])setWhy(m[1],m[3]);continue;}
    m=line.match(/^(?:SCORE|MATCH\s+CONFIDENCE)\s*[:=\-–—]\s*(-?\d+(?:\.\d+)?)\s*%?(?:\s*[-–—:]\s*(.+))?\s*$/i);
    if(m&&currentCode){setScore(currentCode,m[1]);if(m[2])setWhy(currentCode,m[2]);continue;}

    m=line.match(/^PART\s*\|\s*(P\d{2}|PFM\d{4})\s*\|\s*(\d+)\s*\|\s*(${assessmentPattern})\s*\|\s*(.+)$/i);
    if(m){setPart(m[1],m[2],m[3],m[4]);continue;}
    // Robust component-ID anchored parsing. The model may echo definition text
    // between the component ID and assessment, e.g.:
    // PFM0412.02 :: <definition text>. SUPPORTS - <reason>
    // Anchor on the known component ID first, then locate the first valid assessment
    // token anywhere after it instead of requiring one punctuation/layout shape.
    m=line.match(/^(P\d{2}|PFM\d{4})\.(\d{1,2})\b(.*)$/i);
    if(m){
      const code=m[1].toUpperCase();
      const tail=String(m[3]||'');
      const a=tail.match(new RegExp(`\\b(${assessmentPattern})\\b`,'i'));
      if(a){
        const after=tail.slice((a.index||0)+a[0].length).replace(/^\s*(?:\||::|[:.\-–—])+\s*/,'').trim();
        if(after){setPart(code,m[2],a[1],after);currentCode=code;continue;}
        // A real assessment token is present, but the model put the reason on
        // the next line. Keep the component pending instead of declaring it missing.
        pendingPart={code,part:m[2],assessment:a[1]};
        currentCode=code;
        continue;
      }
      // Heading-only provider form. Record the exact expected component ID, but
      // do not create a component result until a separate structured ASSESSMENT
      // line and then a substantive reason are supplied.
      const concept=expected.find(c=>c.code===code);
      const part=Number(m[2]);
      if(expectedCodes.has(code)&&concept&&Number.isInteger(part)&&part>=1&&part<=concept.definitionParts.length&&tail.trim()){
        pendingPartHeading={code,part};
        currentCode=code;
        continue;
      }
    }
    m=line.match(new RegExp(`^(P\\d{2}|PFM\\d{4})\\.(\\d{1,2})\\s*(?:\\||[:\\-–—]?\\s*)(${assessmentPattern})\\s*(?:\\||[:\\-–—]\\s*)+(.+)$`,'i'));
    if(m){setPart(m[1],m[2],m[3],m[4]);currentCode=m[1].toUpperCase();continue;}
    m=line.match(new RegExp(`^(?:PART\\s*)?\\[?(\\d{1,2})\\]?\\s*[.):\\-–—]?\\s*(${assessmentPattern})\\s*(?:[:\\-–—]\\s*)+(.+)$`,'i'));
    if(m&&currentCode){setPart(currentCode,m[1],m[2],m[3]);continue;}

    m=line.match(/^WHY\s*\|\s*(P\d{2}|PFM\d{4})\s*\|\s*(.+)$/i);
    if(m){setWhy(m[1],m[2]);continue;}
    m=line.match(/^(P\d{2}|PFM\d{4})\s*(?:\||[-–—:]?\s*)WHY\s*(?:\||[:\-–—]?\s*)+(.+)$/i);
    if(m){setWhy(m[1],m[2]);currentCode=m[1].toUpperCase();continue;}
    m=line.match(/^WHY\s*[:\-–—]\s*(.+)$/i);
    if(m&&singleExpectedCode){setWhy(singleExpectedCode,m[1]);continue;}
    m=line.match(/^WHY\s*[:\-–—]?\s*$/i);
    if(m&&singleExpectedCode){pendingWhy=singleExpectedCode;continue;}
  }
  return{state,responsePreview:text.slice(0,1200)};
}

// Final-score calls are single-concept and occasionally come back with a valid
// CODE SCORE line followed by a normal explanatory paragraph but no literal WHY
// label. Keep this tolerance local to the final-score repair path: other parser
// modes remain code/label strict, so unlabeled prose cannot bleed across concepts.
function promptDiagnosticUnlabeledFinalScoreWhy(raw,concept){
  const code=String(concept?.code||'').toUpperCase();
  if(!/^(?:P\d{2}|PFM\d{4})$/.test(code))return'';
  const text=String(raw||'').replace(/```(?:text)?/gi,'').replace(/```/g,'').trim();
  if(!text)return'';

  // A foreign concept code makes the response ambiguous; never infer an unlabeled WHY.
  const mentionedCodes=[...text.matchAll(/\b(P\d{2}|PFM\d{4})\b/gi)].map(m=>m[1].toUpperCase());
  if(mentionedCodes.some(found=>found!==code))return'';

  const lines=text.split(/\r?\n/);
  let scoreLineIndex=-1;
  for(let i=0;i<lines.length;i++){
    const line=cleanPromptDiagnosticLine(lines[i]);
    if(!line)continue;
    const codedScore=new RegExp(`^${promptDiagnosticEscapedRegex(code)}\\s*(?:\\||[-–—:]?\\s*)SCORE\\s*(?:\\||[:=\\-–—]?\\s*)*(-?\\d+(?:\\.\\d+)?)\\s*%?(?:\\s*[-–—:]\\s*(.+))?\\s*$`,'i').exec(line);
    const pipeScore=new RegExp(`^SCORE\\s*\\|\\s*${promptDiagnosticEscapedRegex(code)}\\s*\\|\\s*(-?\\d+(?:\\.\\d+)?)\\s*%?(?:\\s*[-–—:]\\s*(.+))?\\s*$`,'i').exec(line);
    const forScore=new RegExp(`^SCORE\\s+(?:FOR\\s+)?${promptDiagnosticEscapedRegex(code)}\\s*[:=\\-–—]?\\s*(-?\\d+(?:\\.\\d+)?)\\s*%?(?:\\s*[-–—:]\\s*(.+))?\\s*$`,'i').exec(line);
    const match=codedScore||pipeScore||forScore;
    if(!match)continue;
    const n=Number(match[1]);
    if(!Number.isFinite(n)||n<0||n>100)continue;
    // If the score line already carries prose after it, the normal parser treats
    // that prose as WHY; this fallback is unnecessary.
    if(match[2]&&String(match[2]).trim())return'';
    scoreLineIndex=i;
    break;
  }
  if(scoreLineIndex<0)return'';

  const prose=[];
  let started=false;
  const structuredStart=/^(?:(?:P\d{2}|PFM\d{4})(?:\.\d{1,2}\b|\s*(?:\||[-–—:]?\s*)(?:SCORE|WHY)\b)|(?:SCORE|WHY)\b|PART\s*\|)/i;
  for(let i=scoreLineIndex+1;i<lines.length;i++){
    const rawLine=String(lines[i]||'');
    if(!rawLine.trim()){
      if(started)break; // first substantive paragraph only
      continue;
    }
    const line=cleanPromptDiagnosticLine(rawLine);
    if(!line)continue;
    if(structuredStart.test(line))return''; // explicit structure takes precedence
    if(/<\s*(?:WHY|OVERALL\s+SCORE\s+REASON|WHY\s+THESE\s+COMPONENT)/i.test(line))return'';
    if(/^<[^>]+>$/.test(line))return'';
    if(!/[A-Za-z]/.test(line))return'';
    prose.push(line);
    started=true;
  }
  const reason=prose.join(' ').trim();
  return reason.length>=12?reason:'';
}

function promptDiagnosticMissingForConcept(concept,data){
  const missing=[];
  if(data.score==null)missing.push(`${concept.code} SCORE`);
  for(let index=0;index<concept.definitionParts.length;index++)if(!data.parts.has(index+1))missing.push(promptDiagnosticPartId(concept.code,index));
  if(!data.why)missing.push(`${concept.code} WHY`);
  return missing;
}

function finalizePromptDiagnosticConcept(concept,data){
  const missing=promptDiagnosticMissingForConcept(concept,data);
  if(missing.length)throw new Error(`Prompt Diagnostics ${concept.code} incomplete; missing ${missing.join(', ')}`);
  const confidence=Number(data.score);
  if(!Number.isFinite(confidence)||confidence<0||confidence>100)throw new Error(`Prompt Diagnostics confidence for ${concept.code} must be numeric 0-100`);
  const definitionAnalysis=concept.definitionParts.map((partText,index)=>{
    const item=data.parts.get(index+1);
    return{part:index+1,id:promptDiagnosticPartId(concept.code,index),text:partText,assessment:item.assessment,reason:item.reason};
  });
  return{
    code:concept.code,name:concept.name,kind:concept.kind,symbol:concept.symbol,primIds:[...concept.primIds],position:concept.position,
    confidence:Math.round(confidence*10)/10,definition:concept.definition,definitionAnalysis,scoreReason:data.why
  };
}

function promptDiagnosticRepairPrompt({concept,sources,reactions,description,missing}){
  const {sourceLabel,evidenceText}=promptDiagnosticEvidence({sources,reactions,description});
  return `GENREACTRIX PROMPT DIAGNOSTICS — INCOMPLETE CONCEPT REPAIR.

The previous multi-concept answer did not complete the required component-level diagnostic for ${concept.code} ${concept.name}. Re-evaluate THIS ONE CONCEPT from scratch so its final score is based on every definition component, not on a generalized impression.

EVIDENCE SOURCE COMBINATION: ${sourceLabel}
${evidenceText}

${promptDiagnosticConceptBlock(concept)}

SCORING RULES:
- Produce an independent 0-100 match confidence for this concept only.
- Assess every numbered definition component separately, including at 0%.
- Use MATCH_EVIDENCE for positive match evidence, GATE_CONFIRMED for correctly applied limiting/non-qualifier rules, or PARTIAL, ABSENT, CONTRADICTS, NOT_OBSERVABLE as appropriate. Legacy SUPPORTS is accepted as MATCH_EVIDENCE.
- The final score must follow from the component-level findings and use the calibration: 0 none/hard-gated; 1-19 trace; 20-39 weak; 40-59 moderate; 60-79 strong; 80-94 very strong/direct; 95-100 exceptionally complete/unmistakable.
- Cue ≠ meaning. Do not invent evidence or promote an ambiguous cue into a specific cause.
- Keep this concept isolated from unrelated concepts in the same wave.
- The component findings, numeric score, and WHY must agree.
- Do not collapse the definition into a single Evidence paragraph.

The prior response was incomplete. Missing identifiers included: ${missing.join(', ')}.
Return the COMPLETE concept, not merely those missing lines, using these exact record identifiers. Minor punctuation around them is acceptable:
${promptDiagnosticRequiredRecords([concept])}

No JSON is required. No table is required. Every component identifier must appear.`;
}

function promptDiagnosticMergeState(target,source,concept){
  if(!target||!source)return target;
  if(target.score==null&&source.score!=null)target.score=source.score;
  if(!target.why&&source.why)target.why=source.why;
  for(const [part,item] of source.parts||[]){
    const partNumber=Number(part);
    if(Number.isInteger(partNumber)&&partNumber>=1&&partNumber<=concept.definitionParts.length&&!target.parts.has(partNumber))target.parts.set(partNumber,item);
  }
  return target;
}

function promptDiagnosticComponentChunkPrompt({concept,sources,reactions,description,partNumbers}){
  const {sourceLabel,evidenceText}=promptDiagnosticEvidence({sources,reactions,description});
  const requested=partNumbers.map(partNumber=>{
    const index=partNumber-1;
    return `${promptDiagnosticPartId(concept.code,index)} :: ${concept.definitionParts[index]}`;
  }).join('\n');
  const required=partNumbers.map(partNumber=>`${concept.code}.${String(partNumber).padStart(2,'0')} <ASSESSMENT> - <reason>`).join('\n');
  return `GENREACTRIX PROMPT DIAGNOSTICS — COMPONENT CHUNK REPAIR.

Evaluate ONLY the numbered definition components listed below for ${concept.code} ${concept.name}. This is a fallback because the model did not reliably enumerate the entire definition in one response.

EVIDENCE SOURCE COMBINATION: ${sourceLabel}
${evidenceText}

CURRENT WORKER DEFINITION (verbatim):
${concept.definition}

COMPONENTS TO ASSESS NOW:
${requested}

For every component use exactly one label: MATCH_EVIDENCE, GATE_CONFIRMED, PARTIAL, ABSENT, CONTRADICTS, or NOT_OBSERVABLE. Legacy SUPPORTS is accepted as MATCH_EVIDENCE.
Give a concrete evidence-grounded reason for every component, including GATE_CONFIRMED, ABSENT, CONTRADICTS, and NOT_OBSERVABLE. Cue ≠ meaning: do not invent evidence or promote ambiguous cues into specific claims.
Do not give an overall score in this call. Do not discuss unlisted component IDs.

REQUIRED RECORDS:
${required}

Plain text only. Every listed component ID must appear.`;
}

function promptDiagnosticScoreFromPartsPrompt({concept,sources,reactions,description,data}){
  const {sourceLabel,evidenceText}=promptDiagnosticEvidence({sources,reactions,description});
  const findings=concept.definitionParts.map((partText,index)=>{
    const item=data.parts.get(index+1);
    return `${promptDiagnosticPartId(concept.code,index)} ${item.assessment} - ${item.reason}`;
  }).join('\n');
  return `GENREACTRIX PROMPT DIAGNOSTICS — FINAL SCORE FROM COMPLETED COMPONENT FINDINGS.

Concept: ${concept.code} ${concept.name}
EVIDENCE SOURCE COMBINATION: ${sourceLabel}
${evidenceText}

CURRENT WORKER DEFINITION (verbatim):
${concept.definition}

COMPLETED COMPONENT FINDINGS:
${findings}

Now derive ONE independent 0-100 match confidence from those completed findings. The score is not a share of a 100% pool and is not relative to other concepts. Use this calibration: 0 none/hard-gated; 1-19 trace; 20-39 weak; 40-59 moderate; 60-79 strong; 80-94 very strong/direct; 95-100 exceptionally complete/unmistakable. 100 requires essentially no meaningful doubt; genuine positive match evidence should normally prevent 0 unless a hard gate overrides it. GATE_CONFIRMED validates a boundary but does not itself raise match confidence. Do not change the component findings in this call.
The WHY must agree with the numeric score, evaluate this concept only, identify the actual semantic route that earns the score, and must not invent evidence or a more specific cause than the evidence supports.

Return only:
${concept.code} SCORE <0-100>
${concept.code} WHY - <why these component findings justify that score>`;
}

async function runPromptDiagnosticComponentChunks(env,{model,image,concept,sources,reactions,description,data,recoveryLog,callContext}){
  let chunkCalls=0;
  let retries=0;
  while(true){
    const missingParts=[];
    for(let partNumber=1;partNumber<=concept.definitionParts.length;partNumber++)if(!data.parts.has(partNumber))missingParts.push(partNumber);
    if(!missingParts.length)break;
    const partNumbers=missingParts.slice(0,PROMPT_DIAGNOSTIC_COMPONENT_CHUNK_SIZE);
    let completed=false,lastRaw='',fallbackToSingles=false;
    for(let attempt=1;attempt<=2;attempt++){
      const prompt=promptDiagnosticComponentChunkPrompt({concept,sources,reactions,description,partNumbers});
      try{
        chunkCalls++;if(attempt>1)retries++;
        const raw=await runPromptDiagnosticStructured(env,model,image,prompt,null,Math.max(900,500+partNumbers.length*180),'text',{temperature:attempt===1?0.04:0.01,preserveWhitespace:true,providerCallTimeoutMs:PROMPT_DIAGNOSTIC_PROVIDER_CALL_TIMEOUT_MS},{recoveryLog,callContext,stage:'component-chunk',conceptCode:concept.code,componentIds:partNumbers.map(n=>promptDiagnosticPartId(concept.code,n-1)),maxProviderAttempts:2});
        lastRaw=String(raw||'');
        const partial=parsePromptDiagnosticPartial(lastRaw,[concept]);
        promptDiagnosticMergeState(data,partial.state.get(concept.code),concept);
        completed=partNumbers.every(partNumber=>data.parts.has(partNumber));
        if(completed)break;
      }catch(error){
        if(!promptDiagnosticTransientProviderError(error))throw error;
        fallbackToSingles=true;
        promptDiagnosticRecoveryEvent(recoveryLog,{type:'provider-fallback',from:'component-chunk',to:'single-components',failureKind:promptDiagnosticProviderFailureKind(error),stage:'component-chunk',conceptCode:concept.code,componentIds:partNumbers.map(n=>promptDiagnosticPartId(concept.code,n-1)),batchIndex:callContext?.batchIndex??null,callMode:callContext?.callMode??null,waveIndex:callContext?.waveIndex??null});
        break;
      }
    }

    if(fallbackToSingles){
      for(const partNumber of partNumbers){
        if(data.parts.has(partNumber))continue;
        let singleComplete=false;
        for(let attempt=1;attempt<=2;attempt++){
          const prompt=promptDiagnosticComponentChunkPrompt({concept,sources,reactions,description,partNumbers:[partNumber]});
          chunkCalls++;if(attempt>1)retries++;
          const raw=await runPromptDiagnosticStructured(env,model,image,prompt,null,900,'text',{temperature:attempt===1?0.03:0.01,preserveWhitespace:true,providerCallTimeoutMs:PROMPT_DIAGNOSTIC_PROVIDER_CALL_TIMEOUT_MS},{recoveryLog,callContext,stage:'single-component',conceptCode:concept.code,componentIds:[promptDiagnosticPartId(concept.code,partNumber-1)],maxProviderAttempts:3});
          lastRaw=String(raw||'');
          const partial=parsePromptDiagnosticPartial(lastRaw,[concept]);
          promptDiagnosticMergeState(data,partial.state.get(concept.code),concept);
          if(data.parts.has(partNumber)){singleComplete=true;break;}
        }
        if(!singleComplete){
          const id=promptDiagnosticPartId(concept.code,partNumber-1);
          throw diagnosticError(
            `Prompt Diagnostics ${concept.code} single-component recovery remained incomplete; missing ${id}`,
            {phase:'prompt-diagnostics-single-component-repair',conceptCode:concept.code,missingRequirements:[id],batchIndex:callContext?.batchIndex??null,callMode:callContext?.callMode??null,waveIndex:callContext?.waveIndex??null,responsePreview:lastRaw.slice(0,1200)}
          );
        }
      }
      completed=partNumbers.every(partNumber=>data.parts.has(partNumber));
    }

    if(!completed){
      const stillMissing=partNumbers.filter(partNumber=>!data.parts.has(partNumber)).map(partNumber=>`${concept.code}.${String(partNumber).padStart(2,'0')}`);
      throw diagnosticError(
        `Prompt Diagnostics ${concept.code} component chunk remained incomplete; missing ${stillMissing.join(', ')}`,
        {phase:'prompt-diagnostics-component-chunk-repair',conceptCode:concept.code,missingRequirements:stillMissing,batchIndex:callContext?.batchIndex??null,callMode:callContext?.callMode??null,waveIndex:callContext?.waveIndex??null,responsePreview:lastRaw.slice(0,1200)}
      );
    }
  }
  return{chunkCalls,retries};
}

async function runPromptDiagnosticFinalScore(env,{model,image,concept,sources,reactions,description,data,recoveryLog,callContext}){
  let lastRaw='';
  for(let attempt=1;attempt<=2;attempt++){
    data.score=null;data.why='';
    const prompt=promptDiagnosticScoreFromPartsPrompt({concept,sources,reactions,description,data});
    const raw=await runPromptDiagnosticStructured(env,model,image,prompt,null,1000,'text',{temperature:attempt===1?0.04:0.01,preserveWhitespace:true,providerCallTimeoutMs:PROMPT_DIAGNOSTIC_PROVIDER_CALL_TIMEOUT_MS},{recoveryLog,callContext,stage:'final-score',conceptCode:concept.code,maxProviderAttempts:3});
    lastRaw=String(raw||'');
    const partial=parsePromptDiagnosticPartial(lastRaw,[concept]);
    const scored=partial.state.get(concept.code);
    if(scored?.score!=null)data.score=scored.score;
    if(scored?.why)data.why=scored.why;
    if(data.score!=null&&!data.why){
      const unlabeledWhy=promptDiagnosticUnlabeledFinalScoreWhy(lastRaw,concept);
      if(unlabeledWhy)data.why=unlabeledWhy;
    }
    if(data.score!=null&&data.why)return{attempts:attempt,raw:lastRaw};
  }
  const missing=[];if(data.score==null)missing.push(`${concept.code} SCORE`);if(!data.why)missing.push(`${concept.code} WHY`);
  throw diagnosticError(
    `Prompt Diagnostics ${concept.code} final score remained incomplete; missing ${missing.join(', ')}`,
    {phase:'prompt-diagnostics-final-score',conceptCode:concept.code,missingRequirements:missing,batchIndex:callContext?.batchIndex??null,callMode:callContext?.callMode??null,waveIndex:callContext?.waveIndex??null,responsePreview:lastRaw.slice(0,1200)}
  );
}

async function runPromptDiagnosticConceptRepair(env,{model,image,concept,sources,reactions,description,missing,seedData,recoveryLog,callContext}){
  const data=promptDiagnosticEmptyState([concept]).get(concept.code);
  if(seedData)promptDiagnosticMergeState(data,seedData,concept);
  let fullRepairAttempts=0,lastRaw='',focusedProviderFallback=false;

  // One focused whole-concept attempt comes first. A transient provider failure
  // is infrastructure noise: retry it automatically, then fall through to the
  // smaller component path instead of killing the diagnostic run.
  {
    const prompt=promptDiagnosticRepairPrompt({concept,sources,reactions,description,missing});
    try{
      const raw=await runPromptDiagnosticStructured(env,model,image,prompt,null,Math.max(1800,Math.min(4800,1200+concept.definitionParts.length*110)),'text',{temperature:0.02,preserveWhitespace:true,providerCallTimeoutMs:PROMPT_DIAGNOSTIC_PROVIDER_CALL_TIMEOUT_MS},{recoveryLog,callContext,stage:'focused-concept',conceptCode:concept.code,maxProviderAttempts:2});
      fullRepairAttempts=1;lastRaw=String(raw||'');
      const partial=parsePromptDiagnosticPartial(lastRaw,[concept]);
      promptDiagnosticMergeState(data,partial.state.get(concept.code),concept);
    }catch(error){
      if(!promptDiagnosticTransientProviderError(error))throw error;
      focusedProviderFallback=true;
      promptDiagnosticRecoveryEvent(recoveryLog,{type:'provider-fallback',from:'focused-concept',to:'component-chunks',failureKind:promptDiagnosticProviderFailureKind(error),stage:'focused-concept',conceptCode:concept.code,batchIndex:callContext?.batchIndex??null,callMode:callContext?.callMode??null,waveIndex:callContext?.waveIndex??null});
    }
  }

  const missingParts=[];
  for(let partNumber=1;partNumber<=concept.definitionParts.length;partNumber++)if(!data.parts.has(partNumber))missingParts.push(partNumber);
  let componentChunkCalls=0,componentChunkRetries=0,finalScoreAttempts=0;
  if(missingParts.length){
    const chunked=await runPromptDiagnosticComponentChunks(env,{model,image,concept,sources,reactions,description,data,recoveryLog,callContext});
    componentChunkCalls=chunked.chunkCalls;componentChunkRetries=chunked.retries;
  }

  if(missingParts.length||data.score==null||!data.why||focusedProviderFallback){
    const scored=await runPromptDiagnosticFinalScore(env,{model,image,concept,sources,reactions,description,data,recoveryLog,callContext});
    finalScoreAttempts=scored.attempts;lastRaw=scored.raw;
  }

  const stillMissing=promptDiagnosticMissingForConcept(concept,data);
  if(stillMissing.length){
    throw diagnosticError(
      `Prompt Diagnostics ${concept.code} remained incomplete after adaptive repair; missing ${stillMissing.join(', ')}`,
      {phase:'prompt-diagnostics-adaptive-repair',conceptCode:concept.code,missingRequirements:stillMissing,batchIndex:callContext?.batchIndex??null,callMode:callContext?.callMode??null,waveIndex:callContext?.waveIndex??null,responsePreview:lastRaw.slice(0,1200)}
    );
  }
  return{
    result:finalizePromptDiagnosticConcept(concept,data),
    raw:lastRaw,
    attempts:fullRepairAttempts,
    strategy:componentChunkCalls?(focusedProviderFallback?'provider-fallback+component-chunks+final-score':'focused+component-chunks+final-score'):'focused',
    componentChunkCalls,
    componentChunkRetries,
    finalScoreAttempts
  };
}

function promptDiagnosticEscapedRegex(value){return String(value||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}

function promptDiagnosticWhySignals(why){
  why=String(why||'').trim();
  const negativeWhyPatterns=[
    /\bdoes not (?:provide|contain|show|have) (?:any |enough |sufficient )?evidence\b/i,
    /\bno (?:clear |meaningful |sufficient )?evidence\b/i,
    /\bnot enough (?:information|evidence)\b/i,
    /\binsufficient (?:information|evidence)\b/i,
    /\bunclear whether\b/i,
    /\bdoes not support (?:the )?(?:concept|theme)?\b/i,
    /\bnot supported by (?:the )?(?:image|evidence)\b/i,
    /\bdoes not match (?:the )?(?:concept|theme|definition)\b/i
  ];
  const positiveWhyPatterns=[
    /\bstrong match\b/i,
    /\bclear evidence\b/i,
    /\bstrongly supports\b/i,
    /\bsupports (?:the )?(?:concept|theme)\b/i,
    /\bhighly consistent\b/i
  ];
  const positive=positiveWhyPatterns.some(rx=>rx.test(why));
  const negative=negativeWhyPatterns.some(rx=>rx.test(why));
  return{positive,negative,polarity:positive&&negative?'mixed':positive?'positive':negative?'negative':'neutral'};
}

function promptDiagnosticConsistencyIssues(concept,result,callConcepts=[]){
  const issues=[];
  const confidence=Number(result?.confidence);
  const why=String(result?.scoreReason||'').trim();
  const parts=Array.isArray(result?.definitionAnalysis)?result.definitionAnalysis:[];
  const positive=parts.filter(item=>item.assessment==='MATCH_EVIDENCE').length;
  const partial=parts.filter(item=>item.assessment==='PARTIAL').length;
  const whySignals=promptDiagnosticWhySignals(why);

  if(Number.isFinite(confidence)&&confidence>=80&&whySignals.negative)issues.push('high score conflicts with a negative/insufficient-evidence WHY');
  if(Number.isFinite(confidence)&&confidence<=20&&whySignals.positive)issues.push('low score conflicts with a strongly positive WHY');
  if(Number.isFinite(confidence)&&confidence>=80&&positive===0&&partial===0)issues.push('high score has no MATCH_EVIDENCE or PARTIAL component');
  if(Number.isFinite(confidence)&&confidence===0&&positive>0)issues.push('0 score conflicts with positive MATCH_EVIDENCE');

  const ownDefinition=String(concept?.definition||'').toLowerCase();
  for(const other of callConcepts||[]){
    if(!other||other.code===concept.code)continue;
    const code=String(other.code||'');
    const name=String(other.name||'').trim();
    if(code&&new RegExp(`\\b${promptDiagnosticEscapedRegex(code)}\\b`,'i').test(why)){
      issues.push(`WHY references unrelated same-call concept ${code}`);continue;
    }
    if(name&&name.length>=4&&!ownDefinition.includes(name.toLowerCase())&&new RegExp(`\\b${promptDiagnosticEscapedRegex(name)}\\b`,'i').test(why))issues.push(`WHY references unrelated same-call concept ${name}`);
  }
  return[...new Set(issues)];
}

function promptDiagnosticLiteralPlaceholderIssues(raw){
  const issues=[];
  const assessmentPattern='MATCH[_ -]?EVIDENCE|GATE[_ -]?CONFIRMED|EXCLUSION(?:[_ -]?GATE)?[_ -]?CONFIRMED|SUPPORTS|PARTIAL|ABSENT|CONTRADICTS|NOT[_ -]?OBSERVABLE';
  const unresolved=String(raw||'').split(/\r?\n/).some(line=>{
    const marker=/<ASSESSMENT>/i.exec(line);
    if(!marker)return false;
    const after=line.slice(marker.index+marker[0].length);
    // Echoing <ASSESSMENT> is formatting noise, not a structural failure, when
    // the same component line also supplies a real assessment token afterward.
    return !new RegExp(`\\b(?:${assessmentPattern})\\b`,'i').test(after);
  });
  if(unresolved)issues.push('literal <ASSESSMENT> placeholder returned without an allowed assessment token');
  return issues;
}

function promptDiagnosticValidationSnapshot(concept,data,result,raw){
  const assessments={};
  if(data?.parts instanceof Map){
    for(const [part,item] of data.parts)assessments[promptDiagnosticPartId(concept.code,Number(part)-1)]=item?.assessment||null;
  }else if(Array.isArray(result?.definitionAnalysis)){
    for(const item of result.definitionAnalysis)assessments[item.id]=item.assessment;
  }
  const why=String(result?.scoreReason||data?.why||'').trim();
  return{
    parsedScore:result?.confidence??data?.score??null,
    parsedAssessments:assessments,
    whyPolarity:promptDiagnosticWhySignals(why).polarity,
    missingRequirements:promptDiagnosticMissingForConcept(concept,data),
    placeholderIssues:promptDiagnosticLiteralPlaceholderIssues(raw)
  };
}

function promptDiagnosticConsistencyRepairPrompt({concept,sources,reactions,description,issues}){
  const {sourceLabel,evidenceText}=promptDiagnosticEvidence({sources,reactions,description});
  return `GENREACTRIX PROMPT DIAGNOSTICS — CONSISTENCY / EVIDENCE REPAIR.

The previous completed answer for ${concept.code} ${concept.name} was structurally complete but failed validation:
${issues.map((issue,index)=>`${index+1}. ${issue}`).join('\n')}

Re-evaluate THIS ONE CONCEPT from scratch. Do not defend or preserve the previous score.

EVIDENCE SOURCE COMBINATION: ${sourceLabel}
${evidenceText}

${promptDiagnosticConceptBlock(concept)}

${THEME_SEMANTIC_EVIDENCE_RULES}

REPAIR RULES:
- Replace every <ASSESSMENT> placeholder with an actual allowed assessment token. The literal text <ASSESSMENT> is invalid output.
- Use MATCH_EVIDENCE only for positive evidence that raises confidence.
- Use GATE_CONFIRMED when a limiting/non-qualifier rule is correctly recognized; it does not itself raise confidence.
- Also allowed: PARTIAL, ABSENT, CONTRADICTS, NOT_OBSERVABLE.
- Confidence calibration: 0 none/hard-gated; 1-19 trace; 20-39 weak; 40-59 moderate; 60-79 strong; 80-94 very strong/direct; 95-100 exceptionally complete/unmistakable.
- The numeric score, every component finding, and WHY must agree.
- Evaluate only ${concept.code} ${concept.name}. Do not mention or compare unrelated concepts from the same wave.
- Do not invent dirt, hoarding, romance, clinical setting, supernatural danger, altered reality, performance, spectacle, or any other specific condition unless the available evidence actually supports it.
- If the concept fits through one route in a broad definition, identify that route explicitly.

Return the COMPLETE required records:
${promptDiagnosticRequiredRecords([concept])}

Plain text only.`;
}

async function runPromptDiagnosticQualityRepair(env,{model,image,concept,sources,reactions,description,issues,callConcepts,recoveryLog,callContext}){
  let lastRaw='';
  let lastIssues=[...(issues||[])];
  let lastSnapshot={parsedScore:null,parsedAssessments:{},whyPolarity:'neutral',missingRequirements:[],placeholderIssues:[]};
  let componentChunkCalls=0,componentChunkRetries=0,finalScoreAttempts=0;

  for(let attempt=1;attempt<=2;attempt++){
    const placeholderRecovery=attempt===1?'':`\n\nSTRICT RECOVERY: The previous repair may have copied instruction placeholders instead of choosing labels. The literal text <ASSESSMENT> is INVALID OUTPUT. Replace every component placeholder with exactly one allowed token: MATCH_EVIDENCE, GATE_CONFIRMED, PARTIAL, ABSENT, CONTRADICTS, or NOT_OBSERVABLE.`;
    const prompt=promptDiagnosticConsistencyRepairPrompt({concept,sources,reactions,description,issues:lastIssues})+placeholderRecovery;
    let data=null;
    let placeholderIssues=[];
    let providerFallback=false;
    try{
      const raw=await runPromptDiagnosticStructured(env,model,image,prompt,null,Math.max(1800,Math.min(4800,1200+concept.definitionParts.length*110)),'text',{temperature:attempt===1?0.02:0.01,preserveWhitespace:true,providerCallTimeoutMs:PROMPT_DIAGNOSTIC_PROVIDER_CALL_TIMEOUT_MS},{recoveryLog,callContext,stage:'consistency-repair',conceptCode:concept.code,maxProviderAttempts:2});
      lastRaw=String(raw||'');
      const parsed=parsePromptDiagnosticPartial(lastRaw,[concept]);
      data=parsed.state.get(concept.code);
      placeholderIssues=promptDiagnosticLiteralPlaceholderIssues(lastRaw);
    }catch(error){
      if(!promptDiagnosticTransientProviderError(error))throw error;
      providerFallback=true;
      data=promptDiagnosticEmptyState([concept]).get(concept.code);
      promptDiagnosticRecoveryEvent(recoveryLog,{type:'provider-fallback',from:'consistency-repair',to:'component-chunks',failureKind:promptDiagnosticProviderFailureKind(error),stage:'consistency-repair',conceptCode:concept.code,batchIndex:callContext?.batchIndex??null,callMode:callContext?.callMode??null,waveIndex:callContext?.waveIndex??null});
    }

    let missing=promptDiagnosticMissingForConcept(concept,data);
    if(missing.length||placeholderIssues.length||providerFallback){
      try{
        const missingParts=[];
        for(let partNumber=1;partNumber<=concept.definitionParts.length;partNumber++)if(!data.parts.has(partNumber))missingParts.push(partNumber);
        if(missingParts.length){
          const chunked=await runPromptDiagnosticComponentChunks(env,{model,image,concept,sources,reactions,description,data,recoveryLog,callContext});
          componentChunkCalls+=chunked.chunkCalls;componentChunkRetries+=chunked.retries;
        }
        if(missingParts.length||data.score==null||!data.why||placeholderIssues.length||providerFallback){
          const scored=await runPromptDiagnosticFinalScore(env,{model,image,concept,sources,reactions,description,data,recoveryLog,callContext});
          finalScoreAttempts+=scored.attempts;lastRaw=scored.raw||lastRaw;
        }
      }catch(error){
        lastSnapshot=promptDiagnosticValidationSnapshot(concept,data,null,lastRaw);
        lastIssues=[...new Set([...placeholderIssues,...lastSnapshot.missingRequirements.map(item=>`missing ${item}`)])];
        if(attempt<2)continue;
        throw diagnosticError(
          `Prompt Diagnostics ${concept.code} quality repair remained structurally incomplete`,
          {
            phase:'prompt-diagnostics-consistency-repair',conceptCode:concept.code,validationIssues:lastIssues,
            parsedScore:lastSnapshot.parsedScore,parsedAssessments:lastSnapshot.parsedAssessments,whyPolarity:lastSnapshot.whyPolarity,
            missingRequirements:lastSnapshot.missingRequirements,placeholderIssues:lastSnapshot.placeholderIssues,
            batchIndex:callContext?.batchIndex??null,callMode:callContext?.callMode??null,waveIndex:callContext?.waveIndex??null,
            responsePreview:lastRaw.slice(0,1200),nestedDiagnostic:error?.providerDiagnostic||null
          }
        );
      }
    }

    missing=promptDiagnosticMissingForConcept(concept,data);
    if(missing.length){
      lastSnapshot=promptDiagnosticValidationSnapshot(concept,data,null,lastRaw);
      lastIssues=[...new Set([...placeholderIssues,...missing.map(item=>`missing ${item}`)])];
      continue;
    }

    const result=finalizePromptDiagnosticConcept(concept,data);
    const remaining=promptDiagnosticConsistencyIssues(concept,result,callConcepts);
    lastSnapshot=promptDiagnosticValidationSnapshot(concept,data,result,lastRaw);
    if(!remaining.length)return{result,attempts:attempt,raw:lastRaw,componentChunkCalls,componentChunkRetries,finalScoreAttempts};
    lastIssues=remaining;
  }

  throw diagnosticError(
    `Prompt Diagnostics ${concept.code} remained inconsistent after quality repair`,
    {
      phase:'prompt-diagnostics-consistency-repair',conceptCode:concept.code,validationIssues:lastIssues,
      parsedScore:lastSnapshot.parsedScore,parsedAssessments:lastSnapshot.parsedAssessments,whyPolarity:lastSnapshot.whyPolarity,
      missingRequirements:lastSnapshot.missingRequirements,placeholderIssues:lastSnapshot.placeholderIssues,
      batchIndex:callContext?.batchIndex??null,callMode:callContext?.callMode??null,waveIndex:callContext?.waveIndex??null,
      responsePreview:lastRaw.slice(0,1200)
    }
  );
}

async function runPromptDiagnosticBatch(env,body){
  const callSpec=promptDiagnosticCallSpec(body);
  const {batchIndex,callMode,waveIndex,waveNumber,waveCount,conceptOffset,concepts}=callSpec;
  const callContext={batchIndex,batchNumber:batchIndex+1,callMode,waveIndex,waveNumber,conceptCodes:concepts.map(c=>c.code)};
  const recoveryLog=[];
  const sources=normalizePromptDiagnosticSources(body?.sources);
  const reactions=normalizePromptDiagnosticReactionScores(body?.reactions);
  const description=sources.description?String(body?.description||'').trim().slice(0,12000):'';
  if(sources.description&&!description)throw new Error('Prompt Diagnostics selected Description but no AI Description was supplied');
  if(sources.reactions&&(!body?.reactions||typeof body.reactions!=='object'))throw new Error('Prompt Diagnostics selected Reactions but no Reaction scores were supplied');
  const image=sources.image?(body.imageDataUrl?dataUrlBytes(body.imageDataUrl):await fetchBytes(body.imageUrl)):null;
  const model=env.WORKERS_AI_VISION_MODEL||DEFAULT_MODEL;
  const prompt=promptDiagnosticPrompt({callSpec,sources,reactions,description});
  const outputTokens=callMode==='three'?3000:callMode==='five'?3600:7200;
  let lastRaw='',initialPartial=null;

  for(let attempt=1;attempt<=2;attempt++){
    const recovery=attempt===1?'':`\n\nRECOVERY: Your previous response did not reliably use the explicit component IDs. Do not write Definition/Evidence/Score paragraphs. Complete the required CODE SCORE, CODE.NN assessment, and CODE WHY records.`;
    try{
      const raw=await runPromptDiagnosticStructured(env,model,image,prompt+recovery,null,outputTokens,'text',{temperature:attempt===1?0.10:0.02,preserveWhitespace:true,providerCallTimeoutMs:PROMPT_DIAGNOSTIC_PROVIDER_CALL_TIMEOUT_MS},{recoveryLog,callContext,stage:'multi-concept-wave',componentIds:null,maxProviderAttempts:2});
      lastRaw=String(raw||'');
      initialPartial=parsePromptDiagnosticPartial(lastRaw,concepts);
      const complete=concepts.filter(c=>promptDiagnosticMissingForConcept(c,initialPartial.state.get(c.code)).length===0);
      if(complete.length===concepts.length)break;
      if(complete.length===0||attempt===2)break;
    }catch(error){
      if(!promptDiagnosticTransientProviderError(error))throw error;
      // A random provider outage must not kill a 105-concept run. Preserve any
      // usable records from an earlier semantic attempt and let the normal
      // focused repair loop complete only the missing concepts.
      promptDiagnosticRecoveryEvent(recoveryLog,{type:'provider-fallback',from:'multi-concept-wave',to:'focused-concepts',failureKind:promptDiagnosticProviderFailureKind(error),stage:'multi-concept-wave',batchIndex,callMode,waveIndex,waveNumber,conceptCodes:concepts.map(c=>c.code)});
      if(!initialPartial)initialPartial={state:promptDiagnosticEmptyState(concepts),responsePreview:''};
      break;
    }
  }

  if(!initialPartial)initialPartial=parsePromptDiagnosticPartial(lastRaw,concepts);
  const resultsByCode=new Map();
  const focusedRepairs=[];
  for(const concept of concepts){
    const data=initialPartial.state.get(concept.code);
    const missing=promptDiagnosticMissingForConcept(concept,data);
    let result;
    let repairMeta=null;
    if(!missing.length){
      result=finalizePromptDiagnosticConcept(concept,data);
    }else{
      const repaired=await runPromptDiagnosticConceptRepair(env,{model,image,concept,sources,reactions,description,missing,seedData:data,recoveryLog,callContext});
      result=repaired.result;
      repairMeta={code:concept.code,attempts:repaired.attempts,strategy:repaired.strategy,componentChunkCalls:repaired.componentChunkCalls,componentChunkRetries:repaired.componentChunkRetries,finalScoreAttempts:repaired.finalScoreAttempts,initialMissing:missing,qualityRepairAttempts:0,validationIssues:[]};
    }

    const validationIssues=promptDiagnosticConsistencyIssues(concept,result,concepts);
    if(validationIssues.length){
      const quality=await runPromptDiagnosticQualityRepair(env,{model,image,concept,sources,reactions,description,issues:validationIssues,callConcepts:concepts,recoveryLog,callContext});
      result=quality.result;
      if(!repairMeta)repairMeta={code:concept.code,attempts:0,strategy:'consistency/evidence-repair',componentChunkCalls:quality.componentChunkCalls||0,componentChunkRetries:quality.componentChunkRetries||0,finalScoreAttempts:quality.finalScoreAttempts||0,initialMissing:[],qualityRepairAttempts:quality.attempts,validationIssues};
      else{repairMeta.strategy=`${repairMeta.strategy}+consistency/evidence-repair`;repairMeta.qualityRepairAttempts=quality.attempts;repairMeta.validationIssues=validationIssues;repairMeta.componentChunkCalls+=(quality.componentChunkCalls||0);repairMeta.componentChunkRetries+=(quality.componentChunkRetries||0);repairMeta.finalScoreAttempts+=(quality.finalScoreAttempts||0);}
    }
    resultsByCode.set(concept.code,result);
    if(repairMeta)focusedRepairs.push(repairMeta);
  }

  return{
    schemaVersion:4,
    matrixVersion:matrixVersion(),
    workerVersion:API_VERSION,
    batchIndex,
    batchNumber:batchIndex+1,
    batchCount:PROMPT_DIAGNOSTIC_BATCH_COUNT,
    batchSize:PROMPT_DIAGNOSTIC_BATCH_SIZE,
    callMode,
    callConceptCount:concepts.length,
    conceptOffset,
    waveIndex,
    waveNumber,
    waveCount,
    sourceCombination:promptDiagnosticSourceLabel(sources),
    sources,
    model,
    evaluatedAt:new Date().toISOString(),
    responseProtocol:'numbered-flex-v4',
    focusedRepairCount:focusedRepairs.length,
    focusedRepairs,
    providerRecoveryCount:recoveryLog.length,
    providerRecoveries:recoveryLog,
    results:concepts.map(c=>resultsByCode.get(c.code))
  };
}

function themeRecoverySchema(){
  const validCodes = PRIMFUSION_REGISTRY.aiThemeChoices.map(t=>t.code);
  return {
    type:'object',
    properties:{
      themes:{
        type:'array',minItems:3,maxItems:3,
        items:{
          type:'object',
          properties:{
            source:{type:'string',enum:CUSTOM_THEME_GENERATION_ENABLED?['matrix','custom']:['matrix']},
            value:{type:'string'},
            confidence:{type:'number',minimum:0,maximum:100},
            rationale:{type:'string'}
          },
          required:['source','value','confidence','rationale'],
          additionalProperties:false
        }
      }
    },
    required:['themes'],
    additionalProperties:false
  };
}

function themeStructuredRecoveryPrompt(analysisContext=""){
  const example = CUSTOM_THEME_GENERATION_ENABLED
    ? `{"themes":[{"source":"matrix","value":"PFM0205","confidence":92,"rationale":"image-grounded reason"},{"source":"matrix","value":"PFM0104","confidence":81,"rationale":"image-grounded reason"},{"source":"custom","value":"Distinct Custom Theme","confidence":70,"rationale":"image-grounded reason"}]}`
    : `{"themes":[{"source":"matrix","value":"PFM0205","confidence":92,"rationale":"image-grounded reason"},{"source":"matrix","value":"PFM0104","confidence":81,"rationale":"image-grounded reason"},{"source":"matrix","value":"PFM0608","confidence":70,"rationale":"image-grounded reason"}]}`;
  return `${themePrompt(analysisContext)}

STRUCTURED RECOVERY MODE:
The normal three-line response could not be parsed. Re-evaluate the image and return exactly one JSON object with exactly three DIFFERENT selections:
${example}
For source "matrix", value MUST be one valid PFM code from the vocabulary above.
${CUSTOM_THEME_GENERATION_ENABLED ? 'For source "custom", value MUST be a concise semantic Theme name that does not duplicate a matrix Theme or standalone Prim.' : 'Custom Theme output is disabled. Every source MUST be "matrix".'}
Return exactly three unique selections and use every required field.`;
}

function parseThemeStructured(raw){
  const themes = Array.isArray(raw?.themes) ? raw.themes : [];
  const byCode = new Map(PRIMFUSION_REGISTRY.aiThemeChoices.map(t=>[t.code,t]));
  const existingNames = new Set(PRIMFUSION_REGISTRY.aiThemeChoices.map(t=>String(t.name).trim().toLowerCase()));
  const primitiveNames = new Set(PRIMFUSION_REGISTRY.primitives.map(p=>String(p.name).trim().toLowerCase()));
  const usedCodes = new Set();
  const usedNames = new Set();
  const selections = [];

  for (const item of themes){
    if (!item || typeof item !== 'object') continue;
    const source = String(item.source||'').toLowerCase();
    const value = String(item.value||'').trim();
    const confidence = Number(item.confidence);
    const rationale = String(item.rationale||'').trim();
    if (!value || !Number.isFinite(confidence)) continue;

    if (source === 'matrix') {
      const resolved = byCode.get(value);
      if (!resolved || usedCodes.has(value)) continue;
      const nameKey = String(resolved.name).trim().toLowerCase();
      if (usedNames.has(nameKey)) continue;
      usedCodes.add(value);
      usedNames.add(nameKey);
      selections.push({rank:selections.length+1,source:'matrix',code:value,confidence:Math.max(0,Math.min(100,confidence)),rationale});
    } else if (source === 'custom' && CUSTOM_THEME_GENERATION_ENABLED) {
      const nameKey = value.toLowerCase();
      if (existingNames.has(nameKey) || primitiveNames.has(nameKey) || usedNames.has(nameKey)) continue;
      usedNames.add(nameKey);
      selections.push({rank:selections.length+1,source:'custom',proposedName:value,confidence:Math.max(0,Math.min(100,confidence)),rationale});
    }
  }

  if (selections.length !== 3) {
    throw diagnosticError(
      `Theme structured recovery yielded ${selections.length} unique valid selections instead of 3`,
      {
        phase:'theme-structured-parse',
        responseType:Array.isArray(raw) ? 'array' : typeof raw,
        responsePreview:JSON.stringify(raw).slice(0,1200)
      }
    );
  }

  return selections;
}

function parseThemeText(raw){
  const lines = String(raw).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const byCode = new Map(PRIMFUSION_REGISTRY.aiThemeChoices.map(t=>[t.code,t]));
  const existingNames = new Map(
    PRIMFUSION_REGISTRY.aiThemeChoices.map(t=>[String(t.name).trim().toLowerCase(),t])
  );
  const primitiveNames = new Set(PRIMFUSION_REGISTRY.primitives.map(p=>String(p.name).trim().toLowerCase()));
  const selections = [];
  const usedCodes = new Set();
  const usedNames = new Set();

  const addSelection = selection => {
    const canonicalName = selection.source === 'matrix'
      ? String(byCode.get(selection.code)?.name || '').trim()
      : String(selection.proposedName || '').trim();

    if (!canonicalName) return false;

    const nameKey = canonicalName.toLowerCase();
    if (selection.source === 'matrix') {
      if (!byCode.has(selection.code) || usedCodes.has(selection.code) || usedNames.has(nameKey)) return false;
    } else {
      // A custom Theme is invalid if it merely duplicates any existing matrix Theme
      // or a Theme already selected in this result.
      if (existingNames.has(nameKey) || primitiveNames.has(nameKey) || usedNames.has(nameKey)) return false;
    }

    if (selection.source === 'matrix') usedCodes.add(selection.code);
    usedNames.add(nameKey);
    selections.push(selection);
    return true;
  };

  for (const line of lines) {
    const cleaned = line.replace(/^\s*[-*]\s*/, '');
    const parts = cleaned.split('|').map(x=>x.trim());
    if (parts.length < 4) continue;

    const rank = Number(parts[0].replace(/[^0-9]/g,''));
    const source = parts[1].toLowerCase();
    const value = parts[2];
    const confidence = Math.max(0, Math.min(100, Number(parts[3].replace(/[^0-9.]/g,''))));
    const rationale = parts.slice(4).join('|').trim();

    if (![1,2,3].includes(rank) || !Number.isFinite(confidence)) continue;

    if (source === 'matrix' && byCode.has(value)) {
      addSelection({
        rank,
        source:'matrix',
        code:value,
        confidence,
        rationale
      });
    } else if (source === 'custom' && CUSTOM_THEME_GENERATION_ENABLED && value) {
      addSelection({
        rank,
        source:'custom',
        proposedName:value,
        confidence,
        rationale
      });
    }
  }

  // Fallback for Markdown/prose output. Preserve the explanatory text from
  // the line/paragraph around each code as rationale where possible.
  if (selections.length < 3) {
    const rawText = String(raw);
    const codePattern = /\b(PFM(?:0[1-9]|1[0-4])(?:0[1-9]|1[0-4]))\b/g;
    let match;

    while ((match = codePattern.exec(rawText)) && selections.length < 3) {
      const code = match[1];
      if (!byCode.has(code) || usedCodes.has(code)) continue;

      const lineStart = rawText.lastIndexOf('\n', match.index) + 1;
      const lineEndRaw = rawText.indexOf('\n', match.index);
      const lineEnd = lineEndRaw === -1 ? rawText.length : lineEndRaw;
      const line = rawText.slice(lineStart, lineEnd).trim();

      const added = addSelection({
        rank:selections.length+1,
        source:'matrix',
        code,
        confidence:Math.max(60,90-(selections.length*10)),
        rationale:line
      });

      if (!added) continue;
    }
  }

  selections.sort((a,b)=>a.rank-b.rank);

  if (selections.length !== 3) {
    throw diagnosticError(
      `Theme provider response yielded ${selections.length} unique valid selections instead of 3`,
      {
        phase:'theme-text-parse',
        responseType:'string',
        responsePreview:String(raw).slice(0,1200)
      }
    );
  }

  // Normalize ranks after duplicate filtering/fallback.
  return selections.slice(0,3).map((item,index)=>({...item,rank:index+1}));
}

function resolveThemes(rawThemes){
  const byCode = new Map(PRIMFUSION_REGISTRY.aiThemeChoices.map(t=>[t.code,t]));
  return rawThemes.map((item,index)=>{
    if (item.source === 'matrix'){
      const resolved = byCode.get(item.code);
      if (!resolved) throw new Error(`Unknown matrix Theme code ${item.code}`);
      return {
        rank:index+1,
        source:'matrix',
        code:item.code,
        name:resolved.name,
        confidence:item.confidence,
        rationale:String(item.rationale||'').trim(),
        matrixVersion:matrixVersion()
      };
    }
    return {
      rank:index+1,
      source:'custom',
      proposedName:String(item.proposedName||'').trim(),
      confidence:item.confidence,
      rationale:String(item.rationale||'').trim(),
      matrixVersion:matrixVersion()
    };
  });
}

async function analyze(env,body){
  if (!env.AI?.run) throw new Error('Workers AI binding AI is not configured');

  const requested = [...new Set((body.components||[]).filter(x=>COMPONENT_IDS.includes(x)))];
  if (!body.imageId || !requested.length) throw new Error('imageId and components are required');

  const reactionOnly = requested.every(name=>name==='reactions'||name==='reactionReasons');
  const rawReactionSources = body.reactionRerunSources && typeof body.reactionRerunSources==='object' ? body.reactionRerunSources : null;
  const reactionSources = rawReactionSources ? {image:rawReactionSources.image!==false,description:Boolean(rawReactionSources.description)} : {image:true,description:false};
  const reactionDescriptionContext = reactionSources.description ? String(body.reactionDescriptionContext||'').trim().slice(0,6000) : '';
  if (reactionOnly && !reactionSources.image && !reactionSources.description) throw new Error('Reaction rerun requires Image, Description, or both');
  if (reactionOnly && reactionSources.description && !reactionDescriptionContext) throw new Error('Reaction rerun requested Description evidence but no AI Description context was supplied');
  const needsImage = !reactionOnly || reactionSources.image;
  const image = needsImage ? (body.imageDataUrl ? dataUrlBytes(body.imageDataUrl) : await fetchBytes(body.imageUrl)) : null;

  const model = env.WORKERS_AI_VISION_MODEL || DEFAULT_MODEL;
  const components = {};
  const promptVersions = {};
  let customThemeTriggered = false;

  const behaviorFor = names => names.some(name=>requested.includes(name) && body.componentBehaviors?.[name] === 'reanalyze') ? 'reanalyze' : 'analyze';

  // Reaction and Theme families are intentionally analyzed independently.
  // Info outputs share the exact same underlying assessment as their paired classification
  // when both are requested, so research reasoning cannot drift away from the result it explains.
  if (requested.includes('reactions') || requested.includes('reactionReasons')){
    const behavior = behaviorFor(['reactions','reactionReasons']);
    const reactionEvidence = {useImage:reactionSources.image,descriptionContext:reactionDescriptionContext,requireNotes:requested.includes('reactionReasons')};
    const reactionResult = await runReactionAllocation(env,model,image,behavior,reactionEvidence);
    components.reactionDiagnostics = reactionResult.diagnostics;
    if (requested.includes('reactions')) components.reactions = reactionResult.display;
    if (requested.includes('reactionReasons')) components.reactionReasons = {
      rawAiWeights:reactionResult.diagnostics.rawAiWeights,
      ranking:reactionResult.diagnostics.aiRanking,
      notes:reactionResult.diagnostics.effortNotes,
      reactionCombo:reactionResult.diagnostics.reactionCombo,
      singleDominant:reactionResult.diagnostics.singleDominant
    };
    promptVersions.reactions = reactionSources.image&&reactionSources.description
      ? 'genreactrix-reactions-registry-v10-combined-multimodal-guided-json'
      : reactionSources.image
        ? 'genreactrix-reactions-registry-v8-vision-text-validated'
        : 'genreactrix-reactions-registry-v7-rerun-evidence-sources';
    if (requested.includes('reactionReasons')) promptVersions.reactionReasons = 'genreactrix-reaction-info-v2-shared-assessment';
  }

  if (requested.includes('themes') || requested.includes('genreReasons')){
    const behavior = behaviorFor(['themes','genreReasons']),themeRerun=body.themeRerun&&requested.includes('themes')?normalizeThemeRerun(body.themeRerun):null;
    let resolvedThemes;
    if(themeRerun){
      const rerunResult=await runThemeRerun(env,model,image,behavior,themeRerun);
      resolvedThemes=resolveThemes(rerunResult.selections);
      components.themeRerunDiagnostics={
        schemaVersion:1,applied:true,
        protectedSlots:rerunResult.rerun.themeSlots.filter(row=>row.state==='preserve').map(row=>row.slot),
        replaceSlots:rerunResult.rerun.themeSlots.filter(row=>row.state==='replace').map(row=>row.slot),
        neutralSlots:rerunResult.rerun.themeSlots.filter(row=>row.state==='neutral').map(row=>row.slot),
        excludedThemeCodes:[...rerunResult.rerun.excludedThemeCodes],
        includedDescriptionCount:rerunResult.rerun.includedDescriptions.length,
        candidateCounts:Object.fromEntries([1,2,3].map(slot=>[slot,rerunResult.sets[slot].candidates.length]))
      };
      promptVersions.themes='genreactrix-themes-pfm-v9-director-rerun-format-compat';
    }else{
      const themeAnalysisContext = body.themeUseAnalysis ? String(body.themeAnalysisContext||'').trim().slice(0,6000) : '';
      const rawThemes = await runStructured(env,model,image,themePrompt(themeAnalysisContext),themeSchema(),2200,'text',{behavior});
      let parsedThemes;
      let firstError = null;
      let retryRaw = null;
      try{
        parsedThemes = parseThemeText(rawThemes);
      }catch(error){
        if (!/unique valid selections instead of 3/i.test(String(error?.message||''))) throw error;
        firstError = error;
        const recoveryPrompt = `${themePrompt(themeAnalysisContext)}

RECOVERY REQUIREMENT: Your previous attempt did not produce three unique valid Theme selections. Re-evaluate the image independently and return exactly three DIFFERENT valid ranked matrix Theme selections. Do not repeat a Theme code or Theme name. Custom Theme output is disabled for this research phase. Return only the required three-line format.`;
        retryRaw = await runStructured(env,model,image,recoveryPrompt,themeSchema(),2200,'text',{behavior});
        try{
          parsedThemes = parseThemeText(retryRaw);
        }catch(retryError){
          if (!/unique valid selections instead of 3/i.test(String(retryError?.message||''))) throw retryError;
          const structured = await runStructured(
            env,model,image,themeStructuredRecoveryPrompt(themeAnalysisContext),themeRecoverySchema(),2200,'json_schema',
            {behavior,temperature:0}
          );
          parsedThemes = parseThemeStructured(structured);
          components.themeRecovery = {
            recovered:true,mode:'structured-json-fallback',reason:String(firstError?.message||firstError||''),
            firstRawResponse:String(rawThemes).slice(0,4000),retryRawResponse:String(retryRaw).slice(0,4000)
          };
        }
      }
      if (firstError && !components.themeRecovery) {
        components.themeRecovery = {
          recovered:true,mode:'text-retry',reason:String(firstError.message||firstError),
          firstRawResponse:String(rawThemes).slice(0,4000),retryRawResponse:String(retryRaw).slice(0,4000)
        };
      }
      resolvedThemes = resolveThemes(parsedThemes);
      promptVersions.themes = themeAnalysisContext ? 'genreactrix-themes-pfm-v6-analysis-failsafe' : 'genreactrix-themes-pfm-v5-matrix-only-research';
    }
    if (requested.includes('themes')) components.themes = resolvedThemes;
    if (requested.includes('genreReasons')) components.genreReasons = resolvedThemes.map(item=>({
      rank:item.rank,code:item.code||null,name:item.name||item.proposedName||'',confidence:item.confidence,
      rationale:item.rationale,matrixVersion:item.matrixVersion
    }));
    customThemeTriggered = resolvedThemes.some(t=>t.source==='custom');
    if (requested.includes('genreReasons')) promptVersions.genreReasons = themeRerun?'genreactrix-theme-info-v2-director-rerun':'genreactrix-theme-info-v1-shared-assessment';
  }

  if (requested.includes('description')){
    const behavior = behaviorFor(['description']),descriptionRerun=normalizeDescriptionRerun(body.descriptionRerun),scopedEdit=['add','replace'].includes(descriptionRerun?.operation);
    const description = await runStructured(env,model,image,descriptionPrompt(body.directorGuidance,descriptionRerun),descriptionSchema(),3200,'text',{behavior,scopedEdit,preserveWhitespace:scopedEdit});
    if (typeof description !== 'string' || !description.trim()) throw new Error('Description provider response did not contain description text');
    components.description = scopedEdit ? description : description.trim();
    promptVersions.description = descriptionRerun ? `genreactrix-freeform-v3-rerun-workspace-${descriptionRerun.operation}` : (String(body.directorGuidance||'').trim() ? 'genreactrix-freeform-v2-director-guidance' : 'genreactrix-freeform-v1');
  }

  return {
    schemaVersion:3,
    imageId:body.imageId,
    analyzedAt:new Date().toISOString(),
    provider:{id:'cloudflare-workers-ai',displayName:'Genreactrix Vision · Cloudflare Workers AI',model},
    model,
    primFusionMatrixVersion:matrixVersion(),
    promptVersions,
    researchConfiguration:{customThemeGenerationEnabled:CUSTOM_THEME_GENERATION_ENABLED,...(requested.includes('reactions')?{reactionEvidenceSources:{image:reactionSources.image,description:reactionSources.description}}:{})},
    reviewDirectives:{
      autoKeep:customThemeTriggered,
      autoFlag:customThemeTriggered,
      reason:customThemeTriggered ? 'custom-theme-use-or-creation' : null
    },
    components
  };
}

export default {
  async fetch(request,env={}){
    const url = new URL(request.url);

    if (request.method === 'OPTIONS'){
      return new Response(null,{
        status:204,
        headers:{...cors,'access-control-max-age':'86400'}
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/health'){
      return json({
        ok:true,
        service:'Genreactrix AI',
        version:API_VERSION,
        vision:env.AI?'configured':'not-configured',
        provider:'cloudflare-workers-ai',
        primFusionMatrixVersion:matrixVersion(),
        primCount:PRIMFUSION_REGISTRY.primitives.length,
        fusionCount:PRIMFUSION_REGISTRY.fusions.length,
        themeChoiceCount:PRIMFUSION_REGISTRY.aiThemeChoices.length,
        totalThemeVocabularyCount:PRIMFUSION_REGISTRY.themeChoices.length,
        components:COMPONENT_IDS,
        customThemeGenerationEnabled:CUSTOM_THEME_GENERATION_ENABLED,
        promptDiagnostics:{enabled:true,conceptCount:105,batchSize:PROMPT_DIAGNOSTIC_BATCH_SIZE,batchCount:PROMPT_DIAGNOSTIC_BATCH_COUNT,waveSizes:{five:PROMPT_DIAGNOSTIC_FIVE_WAVE_SIZE,three:PROMPT_DIAGNOSTIC_THREE_WAVE_SIZE},componentChunkSize:PROMPT_DIAGNOSTIC_COMPONENT_CHUNK_SIZE,executionModes:['fifteen','five','three','compare'],responseProtocol:'numbered-flex-v4'}
      });
    }

    try{
      if (request.method === 'POST' && url.pathname === '/api/genreactrix/image'){
        if (!env.ANALYSIS_KEY){
          return json({ok:false,error:'Analysis access is not configured'},{status:503});
        }
        if (request.headers.get('x-analysis-key') !== env.ANALYSIS_KEY){
          return json({ok:false,error:'Unauthorized'},{status:401});
        }
        const body = await request.json().catch(()=>null);
        const imageUrl = String(body?.imageUrl||'').trim();
        if (!/^https:\/\//i.test(imageUrl) || imageUrl.length > 2000){
          return json({ok:false,error:'imageUrl must be HTTPS'},{status:400});
        }
        const upstream = await fetch(imageUrl,{headers:{accept:'image/*'}});
        if (!upstream.ok) return json({ok:false,error:`Could not retrieve image (${upstream.status})`},{status:502});
        const contentType = String(upstream.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
        if (!contentType.startsWith('image/')) return json({ok:false,error:'URL did not return an image'},{status:415});
        const bytes = new Uint8Array(await upstream.arrayBuffer());
        if (!bytes.length) return json({ok:false,error:'Image was empty'},{status:422});
        if (bytes.length > 6_000_000) return json({ok:false,error:'Image exceeds 6 MB'},{status:413});
        return new Response(bytes,{status:200,headers:{...cors,'content-type':contentType,'cache-control':'no-store','content-length':String(bytes.length)}});
      }

      if (request.method === 'POST' && url.pathname === '/api/genreactrix/prompt-diagnostics'){
        if (!env.ANALYSIS_KEY){
          return json({ok:false,error:'Analysis access is not configured'},{status:503});
        }
        if (request.headers.get('x-analysis-key') !== env.ANALYSIS_KEY){
          return json({ok:false,error:'Unauthorized'},{status:401});
        }
        const body = await request.json().catch(()=>null);
        if (!body) return json({ok:false,error:'JSON body required'},{status:400});
        return json({ok:true,result:await runPromptDiagnosticBatch(env,body)});
      }

      if (request.method === 'POST' && url.pathname === '/api/genreactrix/analyze'){
        if (!env.ANALYSIS_KEY){
          return json({ok:false,error:'Analysis access is not configured'},{status:503});
        }
        if (request.headers.get('x-analysis-key') !== env.ANALYSIS_KEY){
          return json({ok:false,error:'Unauthorized'},{status:401});
        }

        const body = await request.json().catch(()=>null);
        if (!body) return json({ok:false,error:'JSON body required'},{status:400});

        return json({ok:true,result:await analyze(env,body)});
      }
    }catch(error){
      const body = {ok:false,error:error?.message || String(error)};
      const diagnostic = providerDiagnosticOf(error);
      if (diagnostic) body.providerDiagnostic = diagnostic;
      return json(body,{status:500});
    }

    return json({ok:false,error:'Not found'},{status:404});
  }
};

