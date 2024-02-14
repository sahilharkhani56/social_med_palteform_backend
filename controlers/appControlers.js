import firebase, { auth, db } from "../setup/firebase.js";
import "firebase/compat/firestore";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
export async function Information(req, res) {
  const { email, username, profile, uid } =
    req.body;
  const docRef = firebase.firestore().collection("users").doc(uid);
  try {
    await docRef.set({
      email,
      username,
      profile,
      bio:null,
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
export async function createPost(req, res) {
  const { image, text, createdBy } = req.body;
  const docRef = firebase.firestore().collection("posts");
  try {
    await docRef.add({
      image,
      text,
      createdBy,
      createdAt: new Date(),
      likes:[],
      comments:[],
      bookmarks:[]
    });
    return res.status(200).send({ msg: `Successfully posted` });
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error: `Cann't post` });
  }
}
export async function getPosts(req, res) {
  try {
    const connectionCollectionRef = collection(db, "connections");
    const docRef = firebase.firestore().collection("users");
    const postsCollection = collection(db, "posts");
    const qConnection = query(connectionCollectionRef,where("follower_id", "==", req.params.id));
    const querySnapshotConnection = await getDocs(qConnection);
    const followee = [];
    const posts = [];
    querySnapshotConnection.forEach(async (doc) => {
      const dataUserId = doc.data().followee_id;
      const snapshot = await docRef.doc(dataUserId).get();
      if(snapshot.exists){
      const { username, profile } = snapshot.data();
      followee.push({ username, profile, uid: dataUserId });
      }
    });
    const snapshot = await docRef.doc(req.params.id).get();
    if(snapshot.exists){
    const { username, profile } = snapshot.data();
    followee.push({ username, profile, uid: req.params.id });
    const followeePostsPromises = followee.map(async (followeeDoc) => {
      const followeePostsQuery = query(postsCollection,
        where('createdBy', '==', followeeDoc.uid),
        orderBy('createdAt', 'desc')
      );
      const followeePostsSnapshot = await getDocs(followeePostsQuery);
      const followeePosts = [];
      followeePostsSnapshot.forEach((postDoc) => {
        const {image,text,createdAt,createdBy} = postDoc.data();
        followeePosts.push({image,text,createdAt,createdBy,username:followeeDoc.username,profile:followeeDoc.profile,postId:postDoc.id});
      });
      return followeePosts;
    });
    const followeePostsArrays = await Promise.all(followeePostsPromises);
    followeePostsArrays.forEach((followeePostsArray) => {
      posts.push(...followeePostsArray);
    });
    posts.sort((a, b) => b.createdAt - a.createdAt);
  }
    return res.status(200).send({ msg: "Successfully posted", posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(404).send({ error: `Can't get posts` });
    throw error;
  }
}
async function getAllPostUserData(postSnapshotCollection) {
  const tempPost = [];
  const docRef = firebase.firestore().collection("users");

  try {
    for (const doc of postSnapshotCollection.docs) {
      const { createdBy, createdAt, image, text, likes, bookmarks, comments } = doc.data();
      const snapshot = await docRef.doc(createdBy).get();
      const { username, profile } = snapshot.data();
      tempPost.push({ createdBy, createdAt, image, text, likes, bookmarks, comments, username, profile,postId:doc.id });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  return tempPost;
}
export async function getCurrentUserPost(req, res) {
  try {
    const currentUserUid = req.params.id;
    const postsCollection = collection(db, "posts");
    const postQueryCollection = query(postsCollection, where("createdBy", "==", currentUserUid));
    const postSnapshotCollection = await getDocs(postQueryCollection);
    const posts = await getAllPostUserData(postSnapshotCollection);
    posts.sort((a, b) => b.createdAt - a.createdAt);
    return res.status(200).send({ msg: "get Successfully", posts });
  } catch (error) {
    console.log(error);
    return res.status(404).send({ error: `Can't get posts` });
  }
}
export async function getCurrentUserBookmark(req, res) {
  const postsData=[];
  try {
    const currentUserUid = req.params.id;
    const docRef = firebase.firestore().collection("bookmarks");
    const docRefPost = firebase.firestore().collection("posts");
    const docRefUser = firebase.firestore().collection("users");

    const postBookmark=await docRef.doc(currentUserUid).get();
    try{
      const posts=postBookmark.data().posts;
      const postPromiss=posts.map(async(postId)=>{
      const postSnapshot=await docRefPost.doc(postId).get();
      const { createdBy, createdAt, image, text, likes, bookmarks, comments } = postSnapshot.data();
      const snapshot = await docRefUser.doc(createdBy).get();
      const { username, profile } = snapshot.data();
      postsData.push({ createdBy, createdAt, image, text, likes, bookmarks, comments, username, profile,postId });
      })
      await Promise.all(postPromiss)
      postsData.sort((a, b) => b.createdAt - a.createdAt);
    }
    catch(error){
      console.log(error.message);
    }
    return res.status(200).send({ msg: "get Successfully", posts:postsData });
  } catch (error) {
    console.log(error.message);
    return res.status(404).send({ error: `Can't Bookmark` });
  }
}