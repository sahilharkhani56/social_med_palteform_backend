import firebase, { auth, db } from "../setup/firebase.js";
import "firebase/compat/firestore";
export async function Information(req, res) {
  const { email, username, birthdate, phonenumber, gender, profile, uid } =req.body;
  const docRef = firebase.firestore().collection("users").doc(uid);
  try {
    await docRef.set({
      email,
      username,
      birthdate,
      phonenumber,
      gender,
      profile,
      bio: "",
    });
    return res.status(200).send({ msg: `Successfully Updated Information` });
  } catch (error) {
    return res.status(404).send({ error: `Cann't add Information` });
  }
}
export async function Connections(req, res) {
  const { follower_id, followee_id } = req.body;
  const docRef = firebase.firestore().collection("connections");
  try {
    await docRef.add({
      follower_id,
      followee_id,
    });
    return res
      .status(200)
      .send({ msg: `Successfully added follower,following` });
  } catch (error) {
    return res.status(404).send({ error: `Cann't add follower,following` });
  }
}
export async function getAllUsers(req, res) {
  try {
    const docRef = firebase.firestore().collection("users");
    const snapshot = await docRef.get();
    const users = [];
    snapshot.forEach((doc) => {
      const userData = doc.data();
      const { username, profile } = userData;
      const uid = doc.id;
      if (!(uid === req.params.id)) {
        users.push({ username, profile, uid });
      }
    });
    res.status(200).json(users);
  } catch (error) {
    console.log("Error getting all users:", error);
    res.status(400).json({ message: error.message });
  }
}
export async function getUser(req, res) {
  try {
    const docRef = firebase.firestore().collection("users");
    const snapshot = await docRef
      .where("username", "==", req.params.username)
      .get();
    let userData;
    snapshot.forEach((doc) => {
      userData = doc.data();
      const uid = "uid";
      userData[uid] = doc.id;
    });
    res.status(200).json(userData);
  } catch (error) {
    console.log("Error getting all users:", error);
    res.status(400).json({ message: error.message });
  }
}
export async function editProfile(req, res) {
  const { username, profile, uid, bio } = req.body;
  const docRef = firebase.firestore().collection("users").doc(uid);
//   const snapshot = await docRef.get();
//   let userData = snapshot.data();
  try {
    await docRef.update({
      username,
      profile,
      bio,
    });
    return res.status(200).send({ msg: `Successfully Edited Information` });
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error: `Cann't Edit Information` });
  }
}
