import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useGetChild } from "@workspace/api-client-react";

const STORIES_EASY = [
  {
    id: 1,
    emoji: '🦁',
    minAge: 1,
    title: { ar: 'الأسد والفأر', fr: 'Le Lion et la Souris', en: 'The Lion and the Mouse' },
    desc: { ar: 'قصة تعلّمنا أن الإحسان لا يُنسى', fr: 'Une histoire sur la gratitude', en: 'A story about gratitude' },
    color: '#f59e0b', shadow: '#b45309',
    pages: [
      { ar: 'كان هناك أسد قوي ينام في الغابة...', fr: 'Il était une fois un lion puissant qui dormait dans la forêt...', en: 'Once upon a time, a mighty lion was sleeping in the forest...', emoji: '😴🦁' },
      { ar: 'مرّ فأرٌ صغير وأيقظ الأسد بطريق الخطأ! غضب الأسد كثيراً...', fr: 'Une petite souris passa et réveilla le lion par accident ! Le lion fut très en colère...', en: 'A little mouse ran by and accidentally woke the lion! The lion was very angry...', emoji: '🐭😤' },
      { ar: 'قال الفأر: "أرجوك اعفُ عني! سأساعدك يوماً ما." ضحك الأسد لكنه أطلق سراحه.', fr: 'La souris dit : "S\'il te plaît, pardonne-moi ! Je t\'aiderai un jour." Le lion rit mais la libéra.', en: '"Please forgive me! I will help you someday." The lion laughed but let him go.', emoji: '🙏🦁' },
      { ar: 'بعد أيام، وقع الأسد في شبكة الصيادين. صاح بصوت عالٍ...', fr: 'Quelques jours plus tard, le lion tomba dans un piège. Il rugit très fort...', en: 'Days later, the lion was caught in a hunter\'s net. He roared loudly...', emoji: '🕸️😱' },
      { ar: 'سمع الفأر الأسد وجاء وقطع الشبكة بأسنانه الحادة! نجا الأسد!', fr: 'La souris entendit le lion et vint couper le filet avec ses dents ! Le lion fut sauvé !', en: 'The mouse heard the lion and came to gnaw the net free! The lion was saved!', emoji: '🐭✂️🎉' },
      { ar: 'تعلّمنا: الإحسان لا يُنسى، وكل مخلوق يستطيع أن يساعد.', fr: 'Leçon : La gentillesse n\'est jamais oubliée, et chaque créature peut aider.', en: 'Lesson: Kindness is never forgotten, and every creature can help.', emoji: '💛✨' },
    ],
  },
  {
    id: 2,
    emoji: '🐢',
    minAge: 1,
    title: { ar: 'السلحفاة والأرنب', fr: 'La Tortue et le Lièvre', en: 'The Tortoise and the Hare' },
    desc: { ar: 'التواضع والثبات يصلان للهدف', fr: 'L\'humilité et la persévérance mènent au but', en: 'Humility and persistence reach the goal' },
    color: '#10b981', shadow: '#065f46',
    pages: [
      { ar: 'تحدّى أرنبٌ سريع سلحفاةً بطيئة في سباق...', fr: 'Un lièvre rapide défia une tortue lente dans une course...', en: 'A fast hare challenged a slow tortoise to a race...', emoji: '🐰🐢' },
      { ar: 'ضحك الأرنب من السلحفاة وقال: "سأفوز بسهولة!"', fr: 'Le lièvre se moqua de la tortue : "Je vais gagner facilement !"', en: '"I\'ll win easily!" laughed the hare.', emoji: '😂🐰' },
      { ar: 'بدأ السباق! ركض الأرنب بسرعة ثم جلس يستريح لأنه مطمئن...', fr: 'La course commença ! Le lièvre courut vite puis s\'arrêta pour se reposer...', en: 'The race started! The hare ran fast then stopped to rest, feeling confident...', emoji: '💨🛋️' },
      { ar: 'السلحفاة تمشي ببطء لكن لا تتوقف... خطوة... خطوة... خطوة...', fr: 'La tortue marchait lentement mais ne s\'arrêtait pas... pas à pas...', en: 'The tortoise walked slowly but never stopped... step by step...', emoji: '🐢🚶' },
      { ar: 'نام الأرنب! واستمرت السلحفاة وعبرت خط النهاية أولاً!', fr: 'Le lièvre s\'endormit ! La tortue continua et franchit la ligne d\'arrivée en premier !', en: 'The hare fell asleep! The tortoise kept going and crossed the finish line first!', emoji: '🏆🐢' },
      { ar: 'تعلّمنا: لا تتكبّر، والثبات والصبر يصلان للهدف دائماً.', fr: 'Leçon : Ne sois pas arrogant. La persévérance et la patience atteignent toujours le but.', en: 'Lesson: Don\'t be arrogant. Perseverance and patience always reach the goal.', emoji: '🌟💪' },
    ],
  },
  {
    id: 3,
    emoji: '🌟',
    minAge: 1,
    title: { ar: 'النجمة الصغيرة', fr: 'La Petite Étoile', en: 'The Little Star' },
    desc: { ar: 'كل واحد منا يضيء بطريقته الخاصة', fr: 'Chacun brille à sa propre façon', en: 'Everyone shines in their own way' },
    color: '#8b5cf6', shadow: '#5b21b6',
    pages: [
      { ar: 'في السماء كانت هناك نجمة صغيرة حزينة لأنها تعتقد أنها لا تضيء كثيراً...', fr: 'Dans le ciel, il y avait une petite étoile triste qui pensait qu\'elle ne brillait pas assez...', en: 'In the sky, there was a little star who was sad, thinking she didn\'t shine enough...', emoji: '⭐😢' },
      { ar: 'قالت للقمر: "أنت كبير وجميل، أنا صغيرة ولا يراني أحد."', fr: 'Elle dit à la lune : "Tu es grande et belle, je suis petite et personne ne me voit."', en: '"You are big and beautiful, I am small and no one sees me," she told the moon.', emoji: '🌙💬' },
      { ar: 'ابتسم القمر وقال: "انظري إلى الأرض..."', fr: 'La lune sourit et dit : "Regarde la Terre..."', en: 'The moon smiled and said: "Look at the Earth..."', emoji: '🌙😊' },
      { ar: 'رأت النجمة طفلاً صغيراً ينظر إليها ويقول: "انظر! تلك النجمة الصغيرة الجميلة!"', fr: 'L\'étoile vit un petit enfant qui la regardait et disait : "Regarde ! Cette belle petite étoile !"', en: 'The star saw a little child looking at her saying: "Look! That beautiful little star!"', emoji: '👦✨' },
      { ar: 'فهمت النجمة: لا يهم حجمك، بل يهم أن تضيء وتبذل ما تستطيع.', fr: 'L\'étoile comprit : la taille n\'importe pas, ce qui compte c\'est de briller et faire de son mieux.', en: 'The star understood: size doesn\'t matter, what matters is to shine and do your best.', emoji: '🌟💡' },
      { ar: 'تعلّمنا: أنت مميز وجميل كما أنت! أضئ بنورك الخاص.', fr: 'Leçon : Tu es spécial et beau tel que tu es ! Brille de ta propre lumière.', en: 'Lesson: You are special and beautiful just as you are! Shine with your own light.', emoji: '🌈💛' },
    ],
  },
];

const STORIES_ADVANCED = [
  {
    id: 4,
    emoji: '🧙‍♂️',
    minAge: 7,
    title: { ar: 'الساحر والحكمة', fr: 'Le Magicien et la Sagesse', en: 'The Wizard and Wisdom' },
    desc: { ar: 'العلم والتفكير النقدي أقوى من أي سحر', fr: 'La connaissance est plus puissante que la magie', en: 'Knowledge and critical thinking beat any spell' },
    color: '#6366f1', shadow: '#4338ca',
    pages: [
      { ar: 'في مملكة بعيدة، أعلن ساحرٌ عجوز أنه يملك خاتم الحكمة الذي يجيب على أي سؤال. تدافع الناس من كل مكان...', fr: 'Dans un royaume lointain, un vieux magicien annonça posséder l\'Anneau de Sagesse qui répondait à toutes les questions. Les gens vinrent de partout...', en: 'In a distant kingdom, an old wizard announced he owned the Ring of Wisdom that could answer any question. People came from everywhere...', emoji: '💍🧙‍♂️' },
      { ar: 'جاء ملاّك ثري وسأل: "كيف أصبح أغنى؟" أجاب الخاتم: "اعمل بجدٍّ وادخّر." ضحك الملاّك وقال: "هذا ما يقوله الجميع!"', fr: 'Un riche marchand demanda : "Comment devenir plus riche ?" L\'anneau répondit : "Travaille dur et épargne." Le marchand rit : "Tout le monde dit ça !"', en: 'A rich merchant asked: "How do I become richer?" The ring replied: "Work hard and save." The merchant laughed: "Everyone says that!"', emoji: '💰😏' },
      { ar: 'ثم جاءت فتاة صغيرة اسمها سارة وسألت: "ما هو أثمن شيء في الوجود؟" فصمت الخاتم... ثم قال: "السؤال الصحيح."', fr: 'Puis une petite fille nommée Sara demanda : "Quelle est la chose la plus précieuse ?" L\'anneau se tut... puis dit : "La bonne question."', en: 'Then a small girl named Sara asked: "What is the most precious thing in existence?" The ring went silent... then said: "The right question."', emoji: '👧🤔' },
      { ar: 'تعجّب الجميع. قالت سارة: "أظن أن الخاتم يعكس ما نعرفه بالفعل. الحكمة ليست في الخاتم، بل فينا."', fr: 'Tout le monde fut étonné. Sara dit : "Je pense que l\'anneau reflète ce que nous savons déjà. La sagesse n\'est pas dans l\'anneau, elle est en nous."', en: 'Everyone was amazed. Sara said: "I think the ring reflects what we already know. Wisdom is not in the ring, it\'s in us."', emoji: '💡🌟' },
      { ar: 'ابتسم الساحر العجوز وقال: "وجدتُ أخيراً من يفهم." وأعطى سارة الخاتم، لتكتشف أنه مجرد حلقة نحاسية عادية.', fr: 'Le vieux magicien sourit : "J\'ai enfin trouvé quelqu\'un qui comprend." Il donna l\'anneau à Sara, qui découvrit qu\'il était simplement en cuivre ordinaire.', en: 'The old wizard smiled: "I finally found someone who understands." He gave Sara the ring, and she found it was just an ordinary copper ring.', emoji: '🔮✨' },
      { ar: 'قالت سارة متبسّمة: "الحكمة الحقيقية هي التساؤل والتفكير، لا الثقة العمياء بما يقوله الآخرون."', fr: 'Sara dit en souriant : "La vraie sagesse c\'est de questionner et de réfléchir, pas de faire confiance aveuglément."', en: 'Sara smiled: "True wisdom is questioning and thinking, not blindly trusting what others say."', emoji: '🎓📚' },
      { ar: 'تعلّمنا: لا تقبل الإجابات بلا تفكير. العقل الناقد هو أعظم هبة.', fr: 'Leçon : N\'accepte pas les réponses sans réfléchir. La pensée critique est le plus grand don.', en: 'Lesson: Don\'t accept answers without thinking. Critical thinking is the greatest gift.', emoji: '🧠💫' },
    ],
  },
  {
    id: 5,
    emoji: '🌊',
    minAge: 7,
    title: { ar: 'البحّار الصغير والعاصفة', fr: 'Le Jeune Marin et la Tempête', en: 'The Young Sailor and the Storm' },
    desc: { ar: 'الشجاعة ليست غياب الخوف بل التصرف رغمه', fr: 'Le courage c\'est agir malgré la peur', en: 'Courage means acting despite fear' },
    color: '#0ea5e9', shadow: '#0369a1',
    pages: [
      { ar: 'خرج أحمد البالغ من العمر عشر سنوات مع أبيه في رحلة صيد قصيرة. كان الجو صافياً، والأمواج هادئة...', fr: 'Ahmed, 10 ans, accompagna son père pour une courte partie de pêche. Le temps était clair, les vagues calmes...', en: 'Ten-year-old Ahmed went on a short fishing trip with his father. The weather was clear, the waves calm...', emoji: '🚤☀️' },
      { ar: 'فجأة تحوّل الطقس — تلبّدت السماء بالغيوم السوداء وارتفعت الأمواج. غرق محرك القارب. أصاب الذعرُ أحمد...', fr: 'Soudain le temps tourna — le ciel se couvrit de nuages noirs et les vagues s\'élevèrent. Le moteur du bateau tomba en panne. Ahmed fut pris de panique...', en: 'Suddenly the weather changed — dark clouds filled the sky and waves rose high. The boat\'s engine died. Ahmed was seized by panic...', emoji: '⛈️😨' },
      { ar: 'قال أبوه بهدوء: "أحمد، الخوف طبيعي. لكن الآن نحتاج لعقلك. ما الذي نملكه؟" فكّر أحمد: "المجاديف، وطوق النجاة، والهاتف."', fr: 'Son père dit calmement : "Ahmed, avoir peur c\'est normal. Mais maintenant j\'ai besoin de ta tête. Qu\'avons-nous ?" Ahmed réfléchit : "Les rames, une bouée et un téléphone."', en: 'His father said calmly: "Ahmed, fear is natural. But now I need your mind. What do we have?" Ahmed thought: "The oars, a life ring, and a phone."', emoji: '🤔💡' },
      { ar: 'اتّصل أحمد بخفر السواحل وأعطاهم الإحداثيات بدقة. بينما انتظرا، تولّى أحمد المجاديف ليُبعد القارب عن الصخور...', fr: 'Ahmed appela les gardes-côtes et leur donna les coordonnées avec précision. En attendant, Ahmed prit les rames pour éloigner le bateau des rochers...', en: 'Ahmed called the coast guard and gave them the coordinates accurately. While waiting, Ahmed took the oars to keep the boat from the rocks...', emoji: '📞🚣' },
      { ar: 'وصل المنقذون بعد عشرين دقيقة. لاحقاً سأل الأب: "كيف تغلّبت على خوفك؟" أجاب أحمد: "لم أتغلّب عليه. بل تصرّفت رغمه."', fr: 'Les secours arrivèrent vingt minutes plus tard. Son père demanda : "Comment as-tu surmonté ta peur ?" Ahmed répondit : "Je ne l\'ai pas surmontée. J\'ai agi malgré elle."', en: 'Rescuers arrived twenty minutes later. His father asked: "How did you overcome your fear?" Ahmed replied: "I didn\'t overcome it. I acted despite it."', emoji: '🚁🎉' },
      { ar: 'تعلّمنا: الشجاعة الحقيقية هي التفكير بوضوح والتصرف بحكمة حتى حين تشعر بالخوف.', fr: 'Leçon : Le vrai courage c\'est penser clairement et agir sagement, même quand on a peur.', en: 'Lesson: True courage is thinking clearly and acting wisely even when you are afraid.', emoji: '⚓💪' },
    ],
  },
  {
    id: 6,
    emoji: '🌱',
    minAge: 7,
    title: { ar: 'بستان الأفكار', fr: 'Le Jardin des Idées', en: 'The Garden of Ideas' },
    desc: { ar: 'الإبداع والمثابرة يحوّلان الأحلام إلى واقع', fr: 'La créativité et la persévérance transforment les rêves', en: 'Creativity and persistence transform dreams into reality' },
    color: '#22c55e', shadow: '#15803d',
    pages: [
      { ar: 'كانت ليلى طالبةً في الصف السادس تحبّ اختراع الحلول. في مدرستها لم يكن هناك حديقة خضراء، والطلاب يشعرون بالاختناق بين الجدران الرمادية...', fr: 'Layla était élève de sixième, elle adorait inventer des solutions. Son école n\'avait pas de jardin, les élèves étouffaient entre les murs gris...', en: 'Layla was a sixth-grader who loved inventing solutions. Her school had no garden, and students felt suffocated between gray walls...', emoji: '🏫💭' },
      { ar: 'قدّمت ليلى مقترحاً للمدير: حديقة على السطح تُروى بالمياه المعاد تدويرها من الكافيتيريا. رفض المدير أولاً: "ليس لدينا ميزانية."', fr: 'Layla présenta une proposition à la directrice : un jardin sur le toit arrosé par l\'eau recyclée de la cafétéria. La directrice refusa d\'abord : "Nous n\'avons pas de budget."', en: 'Layla presented a proposal to the principal: a rooftop garden watered by recycled water from the cafeteria. The principal first refused: "We have no budget."', emoji: '📋🌿' },
      { ar: 'لم تستسلم ليلى. بحثت عن شركات راعية، وكتبت خطاباً احترافياً، وعرضت مشروعها في مسابقة العلوم المحلية وفازت بالجائزة الأولى وبتمويل يكفي لبدء المشروع!', fr: 'Layla ne se découragea pas. Elle chercha des sponsors, écrivit une lettre professionnelle, présenta son projet à un concours scientifique et remporta le premier prix avec le financement nécessaire !', en: 'Layla didn\'t give up. She researched sponsors, wrote a professional letter, and presented her project at the local science fair, winning first prize and enough funding to start!', emoji: '🏆✉️' },
      { ar: 'واجهت ليلى مشكلة: نظام الري لم يعمل كما خطّطت. أعادت الحسابات، استشارت مهندساً عبر الإنترنت، وعدّلت التصميم ثلاث مرات حتى نجح.', fr: 'Layla fit face à un problème : le système d\'irrigation ne fonctionnait pas comme prévu. Elle recalcula, consulta un ingénieur en ligne, et modifia la conception trois fois jusqu\'au succès.', en: 'Layla faced a problem: the irrigation system didn\'t work as planned. She recalculated, consulted an engineer online, and modified the design three times until it worked.', emoji: '🔧💧' },
      { ar: 'بعد ستة أشهر، كانت الحديقة تُزهر. زرع الطلاب طماطم وأعشاباً، وأصبح السطح مكاناً للدراسة والراحة. نشرت الصحيفة المحلية قصة ليلى...', fr: 'Six mois plus tard, le jardin fleurissait. Les élèves cultivaient tomates et herbes, le toit devint un lieu d\'étude et de détente. Le journal local publia l\'histoire de Layla...', en: 'Six months later, the garden was blooming. Students grew tomatoes and herbs, and the roof became a place for study and rest. The local newspaper published Layla\'s story...', emoji: '🍅🌸📰' },
      { ar: 'قالت ليلى في المقابلة: "المشاكل ليست عقبات، بل هي أسئلة تنتظر إجابات مبتكرة."', fr: 'Layla dit dans l\'interview : "Les problèmes ne sont pas des obstacles, ce sont des questions qui attendent des réponses créatives."', en: 'Layla said in the interview: "Problems aren\'t obstacles; they\'re questions waiting for creative answers."', emoji: '🎤💚' },
      { ar: 'تعلّمنا: الإبداع يحتاج مثابرة. كل فشل هو درس يُقرّبك من الحل.', fr: 'Leçon : La créativité demande de la persévérance. Chaque échec est une leçon qui te rapproche de la solution.', en: 'Lesson: Creativity requires persistence. Every failure is a lesson that brings you closer to the solution.', emoji: '💡🌱' },
    ],
  },
];

const ALL_STORIES = [...STORIES_EASY, ...STORIES_ADVANCED];

export default function StoriesPage() {
  const { id } = useParams();
  const childId = parseInt(id!);
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();
  const [selectedStory, setSelectedStory] = useState<typeof ALL_STORIES[0] | null>(null);
  const [page, setPage] = useState(0);
  const { getAuthHeaders } = useAuth();
  const { data: child } = useGetChild(childId, { request: getAuthHeaders() });
  const childAge = child?.age ?? 6;

  const isAdvanced = childAge >= 7;
  const stories = isAdvanced ? ALL_STORIES : STORIES_EASY;

  const L = {
    ar: { title: 'قصصي', back: 'رجوع', start: 'ابدأ القصة', next: 'التالي ▶', prev: '◀ السابق', end: 'انتهت القصة 🎉', chooseStory: 'اختر قصة!', advanced: 'قصص متقدمة' },
    fr: { title: 'Mes Histoires', back: 'Retour', start: 'Commencer', next: 'Suivant ▶', prev: '◀ Précédent', end: 'Fin ! 🎉', chooseStory: 'Choisis une histoire !', advanced: 'Histoires avancées' },
    en: { title: 'My Stories', back: 'Back', start: 'Start', next: 'Next ▶', prev: '◀ Prev', end: 'The End! 🎉', chooseStory: 'Choose a story!', advanced: 'Advanced stories' },
  }[lang as 'ar' | 'fr' | 'en'] ?? { title: 'Stories', back: 'Back', start: 'Start', next: 'Next', prev: 'Prev', end: 'End!', chooseStory: 'Choose!', advanced: 'Advanced' };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #ede9fe 50%, #fce7f3 100%)' }}>
      {/* Floating decorations — 3D */}
      {[{e:'📚',sh:'#5b21b6'},{e:'⭐',sh:'#b45309'},{e:'🌟',sh:'#d97706'},{e:'📖',sh:'#7c3aed'},{e:'✨',sh:'#f59e0b'}].map((item, i) => (
        <motion.div key={i} className="fixed text-2xl pointer-events-none"
          style={{ left: `${[5,85,10,88,50][i]}%`, top: `${[8,12,70,75,5][i]}%`, opacity: 0.55,
            filter: `drop-shadow(2px 3px 0 ${item.sh}99) drop-shadow(4px 5px 8px rgba(0,0,0,0.25))`,
          }}
          animate={{ y:[0,-10,0], rotate:[0,10,-10,0] }} transition={{ duration: 3+i, repeat: Infinity, delay: i*0.4 }}
        >{item.e}</motion.div>
      ))}

      {/* Header */}
      <header className="relative z-10 px-4 pt-4 pb-2 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => selectedStory ? (setSelectedStory(null), setPage(0)) : setLocation(`/child/${childId}`)}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-violet-700" />
        </motion.button>
        <h1 className="text-xl font-display font-bold text-violet-700">{L.title}</h1>
        {isAdvanced && (
          <span className="ms-auto text-xs bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full">
            🔥 {L.advanced}
          </span>
        )}
      </header>

      <main className="relative z-10 flex-1 max-w-lg mx-auto w-full px-4 pt-2 pb-10">
        <AnimatePresence mode="wait">
          {!selectedStory ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-center text-lg font-bold text-violet-500 mb-5">{L.chooseStory}</p>
              <div className="space-y-4">
                {stories.map((story, i) => {
                  const title = story.title[lang as 'ar' | 'fr' | 'en'] ?? story.title.en;
                  const desc = story.desc[lang as 'ar' | 'fr' | 'en'] ?? story.desc.en;
                  const isAdv = story.minAge >= 7;
                  return (
                    <motion.button key={story.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedStory(story); setPage(0); }}
                      className="w-full rounded-[2rem] p-5 text-white text-start relative overflow-hidden shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${story.color}cc, ${story.shadow})`, boxShadow: `0 8px 0 ${story.shadow}, 0 12px 28px ${story.color}44` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-[2rem]" />
                      {isAdv && (
                        <span className="absolute top-3 end-3 text-xs bg-white/20 font-bold px-2 py-0.5 rounded-full">
                          🔥 {lang === 'ar' ? 'متقدمة' : lang === 'fr' ? 'Avancée' : 'Advanced'}
                        </span>
                      )}
                      <div className="relative flex items-center gap-4">
                        <motion.div animate={{ rotate:[0,15,-15,0], y:[0,-6,0] }} transition={{ duration: 3+i, repeat: Infinity }}
                          style={{ fontSize:'3rem',
                            filter: `drop-shadow(3px 3px 0 ${story.shadow}) drop-shadow(6px 6px 0 ${story.shadow}99) drop-shadow(9px 10px 14px rgba(0,0,0,0.35))`,
                          }}>{story.emoji}</motion.div>
                        <div className="flex-1">
                          <p className="text-white/70 text-xs font-bold mb-0.5">{story.pages.length} {lang === 'ar' ? 'صفحة' : lang === 'fr' ? 'pages' : 'pages'}</p>
                          <h3 className="text-xl font-display font-bold">{title}</h3>
                          <p className="text-white/80 text-sm mt-0.5">{desc}</p>
                        </div>
                        <motion.div animate={{ x:[0,5,0] }} transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-2xl">▶️</motion.div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Story reader */
            <motion.div key="reader" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col h-full">
              <div className="text-center mb-4">
                <h2 className="text-xl font-display font-bold text-violet-700">
                  {selectedStory.title[lang as 'ar' | 'fr' | 'en'] ?? selectedStory.title.en}
                </h2>
                <p className="text-sm text-violet-400">{page + 1} / {selectedStory.pages.length}</p>
              </div>

              <div className="flex justify-center gap-1.5 mb-4">
                {selectedStory.pages.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all ${i === page ? 'w-6 bg-violet-500' : i < page ? 'w-2 bg-violet-300' : 'w-2 bg-slate-200'}`} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={page}
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 bg-white rounded-[2rem] p-6 shadow-xl border-4 border-violet-100 flex flex-col items-center justify-center gap-6 min-h-[260px]"
                >
                  <motion.div
                    animate={{ y:[0,-10,0], rotate:[0,8,-8,0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ fontSize:'4.5rem',
                      filter: `drop-shadow(3px 3px 0 ${selectedStory.shadow}) drop-shadow(6px 6px 0 ${selectedStory.shadow}99) drop-shadow(9px 10px 16px rgba(0,0,0,0.32))`,
                    }}
                  >
                    {selectedStory.pages[page].emoji}
                  </motion.div>
                  <p className={`text-base font-semibold text-slate-700 text-center leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    {selectedStory.pages[page][lang as 'ar' | 'fr' | 'en'] ?? selectedStory.pages[page].en}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-3 mt-5">
                {page > 0 && (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(p => p - 1)}
                    className="flex-1 py-3.5 rounded-2xl font-bold border-2 border-violet-200 text-violet-600 bg-white hover:bg-violet-50 transition-colors"
                  >
                    {L.prev}
                  </motion.button>
                )}
                {page < selectedStory.pages.length - 1 ? (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(p => p + 1)}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-white shadow-md transition-colors"
                    style={{ background: `linear-gradient(135deg, ${selectedStory.color}, ${selectedStory.shadow})` }}
                  >
                    {L.next}
                  </motion.button>
                ) : (
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedStory(null); setPage(0); }}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md transition-colors"
                  >
                    {L.end}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
