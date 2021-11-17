const express = require('express');
const logger = require("morgan");//
const mongoose = require("mongoose");//
const PORT = process.env.PORT || 3000;
const db = require("./models");//
const Workout = require("./models/Workout.js")
const path = require("path")

const app = express();
app.use(logger("dev"));//

app.use(express.urlencoded({ extended: true }));//
app.use(express.json());//
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true,
useUnifiedTopology: true,
useCreateIndex: true,
useFindAndModify: false
});

app.get("/exercise", (err, res) => {
  res.sendFile(path.join(__dirname,'public/exercise.html'))
});

app.get("/stats", (err, res) => {
  res.sendFile(path.join(__dirname,'public/stats.html'))
});

app.get("/api/workouts/", (err, res) => {
  db.Workout.aggregate([
    {
      $addFields: {
        totalDuration: {
          $sum: '$exercises.duration'
        }
      }
    }
  ])
  .then(dbWorkout => {
    res.json(dbWorkout);
  })
  .catch(err => {
    console.log(err);
  });
})

app.get("/api/workouts/range", (req, res) => {
  db.Workout.aggregate([
    {
      $addFields: {
        totalDuration: {
          $sum: '$exercises.duration'
        }
      }
    }
  ])
  .sort({_id: -1})
  .limit(7)
  .then(dbWorkout => {
    res.json(dbWorkout);
  })
  .catch(err => {
    console.log(err);
  });
})

app.post("/api/workouts", ({body}, res) => {
  db.Workout.create(new Workout(body))
  .then(dbWorkout => {
    res.json(dbWorkout);
  })
  .catch(({message}) => {
    console.log(message);
  });
})

app.put("/api/workouts/:id", (req, res) => {
  db.Workout.findOneAndUpdate({where:{id:req.params.id}},{$push:{exercises:req.body}},{new:true})
  .then(dbWorkout => {
    res.json(dbWorkout)
  })
  .catch(err => {
    res.json(err)
  })
})

app.listen(PORT, () =>
  console.log(`Serving on http://localhost:${PORT}`)
);