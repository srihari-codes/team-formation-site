require('dotenv').config();
const mongoose = require('mongoose');
const { Student } = require('./models');

const studentsData = [
  { rollNo: "142223128001", name: "AARTHY.P" },
  { rollNo: "142223128002", name: "ALAGAPPAN PL" },
  { rollNo: "142223128003", name: "ATTI SAI SRIRAM" },
  { rollNo: "142223128004", name: "BALAKUMARAN.S" },
  { rollNo: "142223128005", name: "BENNYHINN TITUS.D" },
  { rollNo: "142223128006", name: "BHUVANESH.S" },
  { rollNo: "142223128007", name: "K.DARSHINI" },
  { rollNo: "142223128008", name: "DEVAN.Y" },
  { rollNo: "142223128009", name: "DHARUNESHWARAN.B.C" },
  { rollNo: "142223128010", name: "DURAI R" },
  { rollNo: "142223128011", name: "GOKUL.A" },
  { rollNo: "142223128012", name: "GOKUL AMARAN.S" },
  { rollNo: "142223128013", name: "C.GOKULA DHARSHAN" },
  { rollNo: "142223128015", name: "HARISH.K" },
  { rollNo: "142223128016", name: "JAYAJEET MANOJ.MA" },
  { rollNo: "142223128017", name: "JEEVANTH EASWAR.K" },
  { rollNo: "142223128018", name: "KARTHIK SELVAM.C" },
  { rollNo: "142223128019", name: "KARTHIKEYAN.S.R" },
  { rollNo: "142223128020", name: "KIRRTANAA.V.S" },
  { rollNo: "142223128021", name: "KRISHNA.P" },
  { rollNo: "142223128023", name: "MAHIBALAA.D" },
  { rollNo: "142223128024", name: "MANOJ KUMAR.P" },
  { rollNo: "142223128025", name: "MANOJ PRASAD.A" },
  { rollNo: "142223128026", name: "MOHAMED SAAJITH.M.S" },
  { rollNo: "142223128027", name: "NAVEEN.N" },
  { rollNo: "142223128028", name: "NAVEEN KUMAR.K" },
  { rollNo: "142223128029", name: "NITHIN.A" },
  { rollNo: "142223128030", name: "NITHYA SHREE.R.V" },
  { rollNo: "142223128031", name: "PIRUTHVIVELRAJ.K.S" },
  { rollNo: "142223128034", name: "RAHUL.S" },
  { rollNo: "142223128035", name: "RAJKUMAR.P" },
  { rollNo: "142223128036", name: "RAKAVI.P" },
  { rollNo: "142223128037", name: "RAKESH KANNAN.C.K" },
  { rollNo: "142223128038", name: "RITHIGA ROOBINI.R" },
  { rollNo: "142223128039", name: "ROHITH KUMAR.R" },
  { rollNo: "142223128040", name: "SAAHITH.G" },
  { rollNo: "142223128041", name: "SAI MOHANA RAM.D" },
  { rollNo: "142223128042", name: "P.SAISHRAVAN" },
  { rollNo: "142223128043", name: "SANTHOSH.J" },
  { rollNo: "142223128044", name: "SARUGESH.S" },
  { rollNo: "142223128045", name: "SHUNMUGA PRIYA.R" },
  { rollNo: "142223128046", name: "SREELAYA.V" },
  { rollNo: "142223128047", name: "SRIHARI.P" },
  { rollNo: "142223128048", name: "SRIMATHI.V" },
  { rollNo: "142223128050", name: "SUJITH.K" },
  { rollNo: "142223128052", name: "TEJESH.U" },
  { rollNo: "142223128053", name: "THISHANTHINI.R" },
  { rollNo: "142223128054", name: "VIJAYA JEEVITHA.V" },
  { rollNo: "142223128056", name: "VINITHA.G" },
  { rollNo: "142223128057", name: "VISHWAA.A" },
  { rollNo: "142223128058", name: "YUGENDIRAN.R" },
  { rollNo: "142223128302", name: "KAVINRAJ" }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const ops = studentsData.map(s => ({
      updateOne: {
        filter: { rollNo: s.rollNo },
        update: { $set: { name: s.name } },
        upsert: false // We only want to update names for now to avoid schema validation errors on INSERT if batch is missing. 
                      // If we wanted to insert, we'd need to know the batch.
      }
    }));

    const result = await Student.bulkWrite(ops);
    console.log('Bulk write result:', result);

    // Check if any students were NOT updated (meaning they didn't exist)
    if (result.matchedCount < studentsData.length) {
        console.warn(`WARNING: Only ${result.matchedCount} out of ${studentsData.length} students were found and updated.`);
        console.log("Identifying missing students...");
        
        for (const s of studentsData) {
            const exists = await Student.findOne({ rollNo: s.rollNo });
            if (!exists) {
                console.log(`Missing in DB: ${s.rollNo} - ${s.name}`);
                // Optional: Insert with a default batch if desired
                // await Student.create({ rollNo: s.rollNo, name: s.name, batch: 'A' });
            }
        }
    } else {
        console.log("All students updated successfully with names.");
    }

  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
