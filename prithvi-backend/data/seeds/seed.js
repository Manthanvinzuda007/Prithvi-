const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../../utils/db');

const TEACHER_ID = 'teacher-001';
const STUDENT_IDS = Array.from({ length: 8 }, (_, i) => `student-00${i+1}`);

async function seedIfEmpty() {
  const users = db.readDB('users');
  if (users.length > 0) return;

  console.log('[SEED] Seeding database with demo data...');
  const passwordHash = await bcrypt.hash('prithvi123', 10);

  const usersData = [
    {
      id: TEACHER_ID, name: 'Ms. Priya Sharma', email: 'priya@school.edu',
      passwordHash, role: 'teacher',
      school: 'Govt. Model Senior Secondary School, Chandigarh',
      grade: null, section: null, subject: 'Environmental Science',
      avatarId: 1, interests: ['Trees & Forests', 'Water Conservation'],
      ecoPoints: 0, level: 'Earth Seedling', streakDays: 0,
      lastActiveDate: null, ecoPledge: 'I pledge to make every student an eco-warrior.',
      createdAt: new Date().toISOString(),
    },
    ...STUDENT_IDS.map((id, i) => ({
      id,
      name: ['Arjun Sharma','Priya Singh','Rohan Kumar','Ananya Patel','Vikram Nair','Sneha Gupta','Rahul Verma','Divya Mehta'][i],
      email: ['arjun@school.edu','priya.s@school.edu','rohan@school.edu','ananya@school.edu','vikram@school.edu','sneha@school.edu','rahul@school.edu','divya@school.edu'][i],
      passwordHash, role: 'student',
      school: 'Govt. Model Senior Secondary School, Chandigarh',
      grade: ['Class 9','Class 10','Class 11','Class 12','Class 9','Class 10','Class 11','Class 12'][i],
      section: ['A','B','A','B','A','B','A','B'][i],
      subject: null, avatarId: (i % 6) + 1,
      interests: [['Trees & Forests','Water Conservation'],['Wildlife','Climate Action'],['Waste Management','Solar Energy'],['Sustainable Farming','Ocean Health'],['Air Quality','Urban Greening'],['Trees & Forests','Waste Management'],['Water Conservation','Climate Action'],['Wildlife','Solar Energy']][i],
      ecoPoints: [340,520,180,610,90,430,270,150][i],
      level: ['Earth Guardian','Nature Champion','Eco Sprout','Nature Champion','Earth Seedling','Earth Guardian','Green Warrior','Eco Sprout'][i],
      streakDays: [7,12,3,20,1,8,5,2][i],
      lastActiveDate: new Date().toDateString(),
      ecoPledge: 'I pledge to protect our planet every day.',
      createdAt: new Date().toISOString(),
    })),
  ];
  db.writeDB('users', usersData);

  db.writeDB('tasks', [
    {
      id: 'task-001', title: 'Plant a Native Tree Sapling',
      description: 'Plant at least one native tree sapling in your school, home, or community area.',
      instructions: ['Choose a native species: Neem, Peepal, Sheesham, or Arjuna','Prepare the planting hole (1.5 feet deep, 1 foot wide)','Add compost to the soil mixture','Plant the sapling and water thoroughly','Mark with a label: your name, date, species','Photograph before, during, and after planting'],
      submissionRequirements: 'Write 100-200 words describing your experience and include a photo link.',
      category: 'tree_planting', difficulty: 'Easy', ecoPointsReward: 75,
      deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      createdBy: TEACHER_ID, assignedTo: 'all',
      ecoBenefit: 'Each tree absorbs ~22 kg of CO₂ per year.',
      submissions: [{
        studentId: STUDENT_IDS[0], description: 'I planted a Neem sapling near our school gate with my friends.',
        proofUrl: 'https://example.com/photo1', selfAssessmentStars: 5,
        submittedAt: new Date(Date.now()-2*24*60*60*1000).toISOString(),
        status: 'pending', teacherComment: '', pointsAwarded: 0, reviewedAt: null,
      }],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-002', title: 'Home Waste Segregation Audit',
      description: 'For one full week, segregate all household waste into Organic, Plastic, Paper, and E-Waste.',
      instructions: ['Set up 4 labeled bins at home','Track daily waste amounts in a simple log','Photograph your segregated waste at end of week','Calculate which type of waste your family generates most','Write 3 suggestions to reduce your biggest waste category'],
      submissionRequirements: 'Share your week-long log + one photo + your 3 reduction suggestions.',
      category: 'waste_segregation', difficulty: 'Medium', ecoPointsReward: 100,
      deadline: new Date(Date.now() + 10*24*60*60*1000).toISOString(),
      createdBy: TEACHER_ID, assignedTo: 'all',
      ecoBenefit: 'Proper waste segregation reduces landfill load by up to 60%.',
      submissions: [], createdAt: new Date().toISOString(),
    },
    {
      id: 'task-003', title: 'Home Energy Audit',
      description: "Audit your home's electricity consumption and identify 5 ways to reduce it.",
      instructions: ['List all electrical appliances at home','Note the wattage of each (from labels)','Estimate daily usage hours','Calculate approximate monthly consumption','Identify the top 3 energy consumers','Propose 5 actionable reduction strategies'],
      submissionRequirements: 'Submit your audit table + 5 strategies as a written report (200+ words).',
      category: 'energy_audit', difficulty: 'Hard', ecoPointsReward: 150,
      deadline: new Date(Date.now() + 14*24*60*60*1000).toISOString(),
      createdBy: TEACHER_ID, assignedTo: 'all',
      ecoBenefit: "Energy efficiency can reduce a household's carbon footprint by 20-30%.",
      submissions: [], createdAt: new Date().toISOString(),
    },
    {
      id: 'task-004', title: 'Water Conservation Survey',
      description: 'Survey water usage in your home for 3 days and find ways to save water.',
      instructions: ['Track all water-using activities for 3 days','Note duration and frequency of each activity','Calculate estimated daily water usage per person','Identify top 3 water-wasting habits','Implement 2 changes and track results'],
      submissionRequirements: 'Submit your 3-day survey log and the 2 changes you implemented.',
      category: 'water_conservation', difficulty: 'Easy', ecoPointsReward: 60,
      deadline: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
      createdBy: TEACHER_ID, assignedTo: 'all',
      ecoBenefit: 'Simple household changes can save 50+ liters of water daily.',
      submissions: [], createdAt: new Date().toISOString(),
    },
    {
      id: 'task-005', title: 'Community Awareness Campaign',
      description: 'Create and share an eco-awareness poster or video in your community.',
      instructions: ['Choose one environmental issue: plastic pollution, water scarcity, or air pollution','Research 5 key facts about the issue','Create a poster or short video','Share it with at least 10 people (family, neighbors, social media)','Document reactions and pledges collected'],
      submissionRequirements: 'Share a photo/link of your awareness material and describe how you spread it.',
      category: 'awareness_campaign', difficulty: 'Medium', ecoPointsReward: 120,
      deadline: new Date(Date.now() + 12*24*60*60*1000).toISOString(),
      createdBy: TEACHER_ID, assignedTo: 'all',
      ecoBenefit: 'Public awareness is the first step toward behavioral change.',
      submissions: [], createdAt: new Date().toISOString(),
    },
  ]);

  db.writeDB('lessons', [
    {
      id: 'lesson-001', title: "The Secret Life of Punjab's Forests",
      category: 'Forests & Trees', difficulty: 'Beginner',
      description: "Discover the incredible biodiversity of Punjab's forests, their importance, and the threats they face.",
      xpReward: 120, durationMinutes: 20, createdBy: TEACHER_ID,
      status: 'published', assignedTo: 'all', thumbnailColor: '#22c55e',
      chapters: [
        {
          id: 'ch-001', title: "Punjab's Forest Cover", order: 1,
          content: [
            { type: 'text', text: "Punjab, though known as the 'Land of Five Rivers', once had extensive forest cover that stretched across its hills and plains. Today, these forests face unprecedented pressure from agriculture, urbanization, and climate change." },
            { type: 'fact_box', text: "Punjab currently has only 3.67% forest cover, compared to the national target of 33% set by the National Forest Policy." },
            { type: 'quiz', id: 'quiz-001', question: "What percentage of forest cover does Punjab currently have?", options: ["1.2%","3.67%","8.5%","15%"], correctIndex: 1, explanation: "Punjab has 3.67% forest cover, well below the national target of 33%.", xpReward: 10 }
          ]
        },
        {
          id: 'ch-002', title: 'Key Forest Types', order: 2,
          content: [
            { type: 'text', text: "Punjab's forests include the Shivalik Hill forests in the northeast, tropical thorn forests in the central plains, and riverine forests along the banks of the five rivers." },
            { type: 'tip_box', text: "The Shivalik forests are home to over 200 species of birds and 50 species of mammals, including leopards and deer." },
            { type: 'quiz', id: 'quiz-002', question: "Which hill range contains Punjab's richest forests?", options: ["Vindhya Range","Shivalik Hills","Aravalli Range","Western Ghats"], correctIndex: 1, explanation: "The Shivalik Hills in northeastern Punjab contain the most biodiverse forests in the state.", xpReward: 10 }
          ]
        },
        {
          id: 'ch-003', title: 'Threats & Conservation', order: 3,
          content: [
            { type: 'text', text: "Punjab's forests face multiple threats: agricultural encroachment, illegal logging, urbanization, and climate change. However, conservation efforts are underway." },
            { type: 'warning_box', text: "At the current rate of deforestation, Punjab could lose 20% of its remaining forest cover by 2040." },
            { type: 'quiz', id: 'quiz-003', question: "What is the biggest threat to Punjab's forests?", options: ["Tourism","Agricultural encroachment","Mining","Flooding"], correctIndex: 1, explanation: "Agricultural expansion is the primary driver of deforestation in Punjab.", xpReward: 10 }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'lesson-002', title: 'Water Warriors: Conserving Punjab\'s Blue Gold',
      category: 'Water Conservation', difficulty: 'Intermediate',
      description: 'Learn about Punjab\'s water crisis, the five rivers, and how you can be a water warrior.',
      xpReward: 150, durationMinutes: 25, createdBy: TEACHER_ID,
      status: 'published', assignedTo: 'all', thumbnailColor: '#0284c7',
      chapters: [
        {
          id: 'ch-004', title: "The Five Rivers Today", order: 1,
          content: [
            { type: 'text', text: "Punjab means 'Land of Five Rivers' - Jhelum, Chenab, Ravi, Beas, and Sutlej. Today, only the Beas and Sutlej flow through Indian Punjab, and both face serious pollution threats." },
            { type: 'fact_box', text: "The Sutlej river receives 450 million liters of untreated sewage and industrial effluent daily from Ludhiana alone." },
            { type: 'quiz', id: 'quiz-004', question: "How many rivers originally gave Punjab its name?", options: ["3","4","5","6"], correctIndex: 2, explanation: "Punjab means 'Five Rivers' (Punj = Five, Aab = Water/Rivers).", xpReward: 10 }
          ]
        }
      ],
      createdAt: new Date().toISOString(),
    },
  ]);

  const pointsData = STUDENT_IDS.map((id, i) => ({
    userId: id,
    totalPoints: [340,520,180,610,90,430,270,150][i],
    level: ['Earth Guardian','Nature Champion','Eco Sprout','Nature Champion','Earth Seedling','Earth Guardian','Green Warrior','Eco Sprout'][i],
    earnedBadges: [['tree-planter','eco-scholar'],['tree-planter','waste-warrior','climate-champion'],['eco-scholar'],['tree-planter','waste-warrior','water-guardian','climate-champion'],[],['waste-warrior','eco-scholar'],['eco-scholar'],[]][i],
    pointsHistory: [{ amount: [340,520,180,610,90,430,270,150][i], reason: 'Initial demo points', earnedAt: new Date().toISOString() }],
    stats: {
      tasksCompleted: [8,12,4,15,2,10,6,3][i],
      lessonsCompleted: [4,6,2,8,1,5,3,1][i],
      tasksByCategory: { tree_planting: [3,4,1,5,0,3,2,1][i], waste_segregation: [2,3,1,4,0,2,2,1][i] },
      quizPerfect: [2,4,1,5,0,3,2,0][i],
      currentStreak: [7,12,3,20,1,8,5,2][i],
      longestStreak: [12,25,5,30,3,14,8,4][i],
      lastActiveDate: new Date().toDateString(),
    },
  }));
  db.writeDB('points', pointsData);

  db.writeDB('pledges', [
    { id: uuidv4(), userId: STUDENT_IDS[0], userName: 'Arjun Sharma', userAvatar: 2, text: 'I will never use single-use plastic and carry my own bag everywhere.', category: 'Waste Management', likes: 8, likedBy: STUDENT_IDS.slice(2,5), createdAt: new Date().toISOString() },
    { id: uuidv4(), userId: STUDENT_IDS[1], userName: 'Priya Singh', userAvatar: 1, text: 'I pledge to plant 12 trees this year — one every month!', category: 'Trees & Forests', likes: 15, likedBy: STUDENT_IDS.slice(0,6), createdAt: new Date().toISOString() },
    { id: uuidv4(), userId: STUDENT_IDS[3], userName: 'Ananya Patel', userAvatar: 4, text: 'I will switch off all lights and fans when leaving any room.', category: 'Energy', likes: 6, likedBy: STUDENT_IDS.slice(1,4), createdAt: new Date().toISOString() },
    { id: uuidv4(), userId: STUDENT_IDS[5], userName: 'Sneha Gupta', userAvatar: 6, text: 'I pledge to compost all organic waste and grow vegetables at home!', category: 'Sustainable Farming', likes: 11, likedBy: STUDENT_IDS.slice(0,5), createdAt: new Date().toISOString() },
  ]);

  db.writeDB('game_scores', []);
  db.writeDB('lesson_progress', []);
  db.writeDB('notifications', []);
  db.writeDB('game_questions', generateQuestions());
  console.log('[SEED] ✓ Database seeded successfully!');
}

function generateQuestions() {
  return [
    { id:'q001', category:'Climate Change', difficulty:'Easy', question:'What gas is primarily responsible for the greenhouse effect?', options:['Oxygen','Carbon Dioxide','Nitrogen','Hydrogen'], correctIndex:1, explanation:'CO₂ traps heat from the sun, warming the Earth surface.', xpReward:10 },
    { id:'q002', category:'Water Conservation', difficulty:'Easy', question:"What percentage of Earth's water is fresh water?", options:['25%','10%','3%','50%'], correctIndex:2, explanation:'Only about 3% of Earth water is fresh water, and most is locked in glaciers.', xpReward:10 },
    { id:'q003', category:'Waste Management', difficulty:'Medium', question:'How many years does a plastic bottle take to decompose?', options:['10 years','50 years','450 years','10,000 years'], correctIndex:2, explanation:'Plastic bottles take approximately 450 years to decompose in a landfill.', xpReward:15 },
    { id:'q004', category:'Biodiversity', difficulty:'Medium', question:'What is the largest contributor to species extinction today?', options:['Climate change','Habitat loss','Pollution','Hunting'], correctIndex:1, explanation:'Habitat loss due to deforestation is the #1 driver of species extinction.', xpReward:15 },
    { id:'q005', category:'Renewable Energy', difficulty:'Easy', question:'Which renewable energy source produces the most electricity globally?', options:['Solar','Wind','Hydropower','Geothermal'], correctIndex:2, explanation:'Hydropower currently generates the largest share of renewable electricity worldwide.', xpReward:10 },
    { id:'q006', category:'Air Quality', difficulty:'Hard', question:'What is PM2.5?', options:['A type of pesticide','Fine particulate matter under 2.5 micrometers','A greenhouse gas measurement','A soil quality index'], correctIndex:1, explanation:'PM2.5 refers to fine particulate matter with diameter less than 2.5 micrometers that can penetrate deep into lungs.', xpReward:20 },
    { id:'q007', category:'Climate Change', difficulty:'Medium', question:'What does "carbon neutral" mean?', options:['Producing no carbon','Absorbing all carbon produced','Balancing emissions with removal','Using only nuclear energy'], correctIndex:2, explanation:'Carbon neutral means any CO₂ released is balanced by an equivalent amount removed.', xpReward:15 },
    { id:'q008', category:'Water Conservation', difficulty:'Hard', question:'How much water does drip irrigation save vs traditional flooding?', options:['10-20%','30-50%','60-70%','80-90%'], correctIndex:1, explanation:'Drip irrigation uses 30-50% less water than traditional flood irrigation.', xpReward:20 },
    { id:'q009', category:'Punjab Ecology', difficulty:'Medium', question:'Which river in Punjab is most severely affected by industrial pollution?', options:['Beas','Ravi','Sutlej','Chenab'], correctIndex:2, explanation:"The Sutlej river receives heavy industrial effluents from Ludhiana's dyeing industry.", xpReward:15 },
    { id:'q010', category:'Forests', difficulty:'Easy', question:"How much of Earth was covered by forests 10,000 years ago vs today?", options:['Same as today','Twice as much','50% more','Three times as much'], correctIndex:1, explanation:"Earth had roughly twice the forest cover 10,000 years ago compared to today.", xpReward:10 },
    { id:'q011', category:'Waste Management', difficulty:'Easy', question:'Which type of waste takes the longest to decompose in a landfill?', options:['Paper','Glass','Organic waste','Cotton'], correctIndex:1, explanation:'Glass can take up to 1 million years to decompose in a landfill.', xpReward:10 },
    { id:'q012', category:'Biodiversity', difficulty:'Easy', question:'What percentage of species live in tropical rainforests?', options:['10%','25%','50%','75%'], correctIndex:2, explanation:'Tropical rainforests cover only 7% of land but host about 50% of all species on Earth.', xpReward:10 },
    { id:'q013', category:'Renewable Energy', difficulty:'Medium', question:'How long does it take the sun to deliver as much energy to Earth as humans use in a year?', options:['1 year','1 month','1 week','1 hour'], correctIndex:3, explanation:'The sun delivers enough energy to Earth in just 1 hour to power all of humanity for a year.', xpReward:15 },
    { id:'q014', category:'Climate Change', difficulty:'Hard', question:'By how much has global average temperature risen since pre-industrial times?', options:['0.5°C','1.1°C','2.0°C','3.5°C'], correctIndex:1, explanation:'Earth has warmed by approximately 1.1°C since pre-industrial times (1850-1900).', xpReward:20 },
    { id:'q015', category:'Agriculture', difficulty:'Medium', question:'What percentage of global greenhouse gas emissions come from agriculture?', options:['5%','11%','24%','40%'], correctIndex:2, explanation:'Agriculture, forestry and land use account for about 24% of global greenhouse gas emissions.', xpReward:15 },
    { id:'q016', category:'Oceans', difficulty:'Easy', question:'What percentage of Earth is covered by oceans?', options:['51%','61%','71%','81%'], correctIndex:2, explanation:'Oceans cover approximately 71% of Earth surface and contain 97% of all water.', xpReward:10 },
    { id:'q017', category:'Air Quality', difficulty:'Medium', question:'What is the main cause of smog in cities like Delhi and Ludhiana?', options:['Natural dust storms','Vehicles and industrial emissions','Ocean evaporation','Forest fires alone'], correctIndex:1, explanation:'Vehicular and industrial emissions are the primary sources of urban smog and particulate pollution.', xpReward:15 },
    { id:'q018', category:'Punjab Ecology', difficulty:'Easy', question:'What environmental problem is caused by crop residue burning in Punjab?', options:['Soil erosion','Severe air pollution','Water contamination','Deforestation'], correctIndex:1, explanation:'Paddy stubble burning in Punjab causes severe air pollution, creating thick smog that affects millions.', xpReward:10 },
    { id:'q019', category:'Water Conservation', difficulty:'Easy', question:'How much water can be saved by fixing a dripping tap?', options:['1 liter/day','15 liters/day','5000 liters/year','Both B and C'], correctIndex:3, explanation:'A dripping tap wastes about 15 liters per day, which adds up to over 5,000 liters per year.', xpReward:10 },
    { id:'q020', category:'Biodiversity', difficulty:'Hard', question:'What is the current global rate of species extinction compared to the natural background rate?', options:['10 times faster','100 times faster','1000 times faster','Same rate'], correctIndex:2, explanation:'Species are going extinct approximately 1,000 times faster than the natural background rate.', xpReward:20 },
    { id:'q021', category:'Waste Management', difficulty:'Medium', question:'What fraction of all plastic ever produced has been recycled?', options:['1/10','1/5','1/3','Half'], correctIndex:0, explanation:'Only about 9% (roughly 1/10) of all plastic ever produced has been recycled.', xpReward:15 },
    { id:'q022', category:'Forests', difficulty:'Medium', question:'How many trees are cut down globally every year?', options:['1 billion','5 billion','10 billion','15 billion'], correctIndex:3, explanation:'Approximately 15 billion trees are cut down globally every year — far exceeding replanting rates.', xpReward:15 },
    { id:'q023', category:'Renewable Energy', difficulty:'Easy', question:'What country produces the most solar energy in the world?', options:['USA','Germany','India','China'], correctIndex:3, explanation:'China leads global solar energy production and has the largest installed solar capacity.', xpReward:10 },
    { id:'q024', category:'Oceans', difficulty:'Medium', question:'How much plastic enters the oceans every year?', options:['100,000 tons','1 million tons','8 million tons','50 million tons'], correctIndex:2, explanation:'About 8 million metric tons of plastic enter the oceans every year — equivalent to a garbage truck per minute.', xpReward:15 },
    { id:'q025', category:'Climate Change', difficulty:'Medium', question:'What does IPCC stand for?', options:['International Panel on Climate Change','Intergovernmental Panel on Climate Change','Indian Panel on Carbon Control','International Protocol on Carbon Capture'], correctIndex:1, explanation:'IPCC = Intergovernmental Panel on Climate Change, the UN body that assesses climate science.', xpReward:15 },
    { id:'q026', category:'Agriculture', difficulty:'Easy', question:'What is organic farming?', options:['Farming using chemicals','Farming without synthetic pesticides or fertilizers','Farming using robots','Hydroponics only'], correctIndex:1, explanation:'Organic farming avoids synthetic pesticides and fertilizers, relying on natural processes.', xpReward:10 },
    { id:'q027', category:'Punjab Ecology', difficulty:'Hard', question:"What percentage of Punjab's groundwater blocks are classified as over-exploited?", options:['20%','40%','68%','85%'], correctIndex:2, explanation:'As of 2022, approximately 68% of Punjab groundwater blocks are over-exploited due to paddy cultivation.', xpReward:20 },
    { id:'q028', category:'Biodiversity', difficulty:'Easy', question:'What are pollinators?', options:['Insects that eat plants','Animals that transfer pollen between plants','Birds that eat seeds','Bacteria in soil'], correctIndex:1, explanation:'Pollinators (bees, butterflies, birds) transfer pollen between plants, enabling reproduction of 75% of flowering plants.', xpReward:10 },
    { id:'q029', category:'Water Conservation', difficulty:'Medium', question:"Which sector uses the most freshwater globally?", options:['Industry','Domestic use','Agriculture','Energy production'], correctIndex:2, explanation:'Agriculture accounts for approximately 70% of all freshwater withdrawals globally.', xpReward:15 },
    { id:'q030', category:'Air Quality', difficulty:'Easy', question:'What gas do plants absorb during photosynthesis?', options:['Oxygen','Nitrogen','Carbon Dioxide','Hydrogen'], correctIndex:2, explanation:'Plants absorb CO₂ during photosynthesis and release oxygen — making forests our best carbon capture tool.', xpReward:10 },
    { id:'q031', category:'Renewable Energy', difficulty:'Hard', question:'What is the efficiency rate of modern solar panels?', options:['5-10%','15-22%','35-50%','60-80%'], correctIndex:1, explanation:'Most commercial solar panels achieve 15-22% efficiency in converting sunlight to electricity.', xpReward:20 },
    { id:'q032', category:'Oceans', difficulty:'Hard', question:'What is ocean acidification?', options:['Oceans becoming saltier','CO₂ dissolving in seawater making it more acidic','Pollution making oceans toxic','Natural tidal cycles'], correctIndex:1, explanation:"CO₂ from the atmosphere dissolves in seawater forming carbonic acid, lowering ocean pH and threatening marine life.", xpReward:20 },
    { id:'q033', category:'Forests', difficulty:'Easy', question:'What is deforestation?', options:['Planting new trees','The clearing of forests for other land uses','Forest fire prevention','Tree pruning techniques'], correctIndex:1, explanation:'Deforestation is the permanent removal of forest cover, often for agriculture, logging, or development.', xpReward:10 },
    { id:'q034', category:'Climate Change', difficulty:'Easy', question:'What is the "carbon footprint" of an activity?', options:['How much land it uses','The total greenhouse gases it produces','Its water usage','Its waste generation'], correctIndex:1, explanation:'Carbon footprint measures the total greenhouse gas emissions caused by an individual, activity, or product.', xpReward:10 },
    { id:'q035', category:'Waste Management', difficulty:'Hard', question:'What is the hierarchy of waste management (in correct order)?', options:['Recycle, Reduce, Reuse','Reduce, Reuse, Recycle','Reuse, Recycle, Reduce','Recycle, Reuse, Reduce'], correctIndex:1, explanation:'The correct hierarchy is Reduce first (best), then Reuse, then Recycle — reducing consumption is most impactful.', xpReward:20 },
    { id:'q036', category:'Biodiversity', difficulty:'Medium', question:'What percentage of medicines come from plants?', options:['10%','25%','50%','80%'], correctIndex:2, explanation:'About 50% of pharmaceutical drugs are derived from plants — making biodiversity critical for medicine.', xpReward:15 },
    { id:'q037', category:'Agriculture', difficulty:'Medium', question:'What is composting?', options:['Burning agricultural waste','Converting organic matter into nutrient-rich soil','A type of chemical fertilizer','Crop rotation technique'], correctIndex:1, explanation:'Composting converts organic waste into nutrient-rich humus, reducing landfill waste and improving soil health.', xpReward:15 },
    { id:'q038', category:'Punjab Ecology', difficulty:'Medium', question:"What bird sanctuary in Punjab is a Ramsar wetland site?", options:['Harike Wetland','Ropar Wetland','Kanjli Wetland','All of the above'], correctIndex:3, explanation:'Punjab has three Ramsar-designated wetlands: Harike, Ropar, and Kanjli — all critical for migratory birds.', xpReward:15 },
    { id:'q039', category:'Water Conservation', difficulty:'Hard', question:'What is the "virtual water" concept?', options:['Water in clouds','The water used to produce food and goods','Underground water tables','Desalinated water'], correctIndex:1, explanation:"Virtual water is the hidden water used throughout a product's supply chain — 1 kg of beef requires 15,000 liters.", xpReward:20 },
    { id:'q040', category:'Renewable Energy', difficulty:'Medium', question:'What is the full form of SDG 7?', options:['Safe Drinking Goals','Sustainable Development Goal 7: Affordable and Clean Energy','Solar Development Guidelines','Standard Development Goals'], correctIndex:1, explanation:'SDG 7 is Sustainable Development Goal 7: Ensure access to affordable, reliable, sustainable, and modern energy.', xpReward:15 },
    { id:'q041', category:'Oceans', difficulty:'Easy', question:'What are coral reefs often called?', options:['Desert of the sea','Rainforests of the sea','Grasslands of the sea','Mountains of the sea'], correctIndex:1, explanation:"Coral reefs are called 'rainforests of the sea' because they support 25% of all marine species.", xpReward:10 },
    { id:'q042', category:'Air Quality', difficulty:'Hard', question:'What is the AQI reading considered hazardous to health?', options:['Above 50','Above 100','Above 300','Above 500'], correctIndex:2, explanation:'An AQI (Air Quality Index) above 300 is considered hazardous, requiring everyone to avoid outdoor activity.', xpReward:20 },
    { id:'q043', category:'Climate Change', difficulty:'Hard', question:'What global temperature limit did the Paris Agreement aim to stay below?', options:['1°C','1.5°C','2°C','Both 1.5°C and 2°C'], correctIndex:3, explanation:'The Paris Agreement aims to limit warming to 1.5°C and well below 2°C above pre-industrial levels.', xpReward:20 },
    { id:'q044', category:'Forests', difficulty:'Medium', question:'What is the Amazon rainforest sometimes called?', options:["Earth's lungs","Earth's heart","Earth's kidney","Earth's liver"], correctIndex:0, explanation:"The Amazon produces 20% of Earth's oxygen and absorbs 2 billion tons of CO₂ annually — earning it the name 'Earth's lungs'.", xpReward:15 },
    { id:'q045', category:'Agriculture', difficulty:'Hard', question:'What percentage of food produced globally is wasted?', options:['10%','20%','33%','50%'], correctIndex:2, explanation:'Approximately one-third of all food produced globally — worth $1 trillion — is wasted each year.', xpReward:20 },
    { id:'q046', category:'Biodiversity', difficulty:'Hard', question:'How many species are estimated to exist on Earth?', options:['500,000','2 million','8.7 million','Over 1 billion'], correctIndex:2, explanation:'Scientists estimate approximately 8.7 million species exist on Earth, with only 1.5 million formally described.', xpReward:20 },
    { id:'q047', category:'Water Conservation', difficulty:'Easy', question:'What is rainwater harvesting?', options:['Collecting rain for immediate drinking','Collecting and storing rainwater for later use','Redirecting rain to rivers','Cloud seeding technology'], correctIndex:1, explanation:'Rainwater harvesting collects and stores rain for later use in agriculture, households, and recharging groundwater.', xpReward:10 },
    { id:'q048', category:'Waste Management', difficulty:'Medium', question:'What happens to e-waste in most developing countries?', options:['It is properly recycled','It is burned or sent to landfills releasing toxins','It is exported back to manufacturers','It is converted to art'], correctIndex:1, explanation:'Most e-waste in developing countries is burned or dumped in landfills, releasing toxic heavy metals like lead and mercury.', xpReward:15 },
    { id:'q049', category:'Punjab Ecology', difficulty:'Easy', question:'What is the main crop causing stubble burning in Punjab?', options:['Wheat','Rice/Paddy','Cotton','Sugarcane'], correctIndex:1, explanation:'Paddy (rice) stubble burning occurs in October-November after the kharif harvest, causing severe air pollution.', xpReward:10 },
    { id:'q050', category:'Climate Change', difficulty:'Medium', question:'What is a carbon sink?', options:['A container for CO₂','A natural system that absorbs more CO₂ than it releases','A factory emission point','An underground storage facility'], correctIndex:1, explanation:'Carbon sinks — like forests, oceans, and soil — absorb more CO₂ than they release, helping slow climate change.', xpReward:15 },
  ];
}

module.exports = { seedIfEmpty };
