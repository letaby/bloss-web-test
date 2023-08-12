import { makeAutoObservable, runInAction } from "mobx";
import {
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  signOut,
  getAdditionalUserInfo,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, tmzn, colors, localStor, timezoneName, user } from "./utils";
import { auth } from "../../config/index";
let gProvider = new GoogleAuthProvider(),
  aProvider = new OAuthProvider("apple.com");
aProvider.addScope("email");
aProvider.addScope("name");
gProvider.addScope("profile");

export default class Auth {
  initializing = false;
  profile = user; // {};

  constructor() {
    makeAutoObservable(this);
  }

  get myid() {
    return this.profile?.uid;
  }

  get age() {
    return this.profile?.age;
  }

  get dbref() {
    return this.myid ? doc(db, "users", this.myid) : null;
  }

  get isactive() {
    return this.myid && !!this.profile.age;
  }

  setProfile = (doc) => (this.profile = doc);

  addDBUser = async (ob) => {
    let { uid } = ob;
    if (!uid) return;
    let user = ob.age
      ? ob
      : {
          ...ob,
          device: "web",
          created: Date.now(),
          timezone: tmzn,
          timezoneName,
          color: colors[Math.round(Math.random() * 27)],
        };
    runInAction(() => (this.setProfile(user), (this.initializing = false)));
    localStor.setItem("myid", uid);
    return setDoc(doc(db, "users", uid), user); //  if no ob.age, means just signed up, so need to fill data at "EditProfile" first. Otherwise, data already filled from  "EditProfile"
  };

  getDBUser = async (ob) => {
    let { uid } = ob;
    console.log("getDBUser ", uid);
    if (!uid) return;
    let data;
    await getDoc(doc(db, "users", uid))
      .then(async (d) => {
        if (d?.exists) data = d.data();
        if (!data) return this.addDBUser(ob);
        runInAction(() => (this.setProfile(data), (this.initializing = false)));
      })
      .catch((er) => console.log("ERROR getDBUser", er));
    data && localStor.setItem("myid", uid);
    return data;
  };

  googleLogin = async () => {
    this.initializing = true;
    signInWithPopup(auth, gProvider) // then will be handled by onAuthStateChanged listener in APP.js
      .catch((err) => {
        console.warn("signInWithRedirect ERROR", err);
        if (err.code.includes("cancelled") || err.code.includes("closed"))
          return;
        alert(
          "Some error with Google Login. Make sure you have an internet connection, then update the page and try again\n\n" +
            (err.message || err.toString())
        );
      })
      .finally(() => runInAction(() => (this.initializing = false)));
  };

  appleLogin = async () => {
    this.initializing = true;
    await signInWithPopup(auth, aProvider)
      .then((res) => {
        let add = getAdditionalUserInfo(res);
        if (add.isNewUser) this.addDBUser(handleGoogleAuthUser(res.user)); // will be handled by onAuthStateChanged listener in APP.js
      })
      .catch((err) => {
        if (err.code.includes("cancelled") || err.code.includes("closed"))
          return;
        alert(
          "Some error with Apple Login. Make sure you have an internet connection, then update the page and try again\n\n" +
            (err.message || err.toString())
        );
      })
      .finally(() => runInAction(() => (this.initializing = false)));
  };

  checkDBUser = async () => this.getDBUser(this.profile);

  logout = async () =>
    await signOut(auth).then(this.setProfile({}), localStor.removeItem("myid"));

  localUpdateFields = (obj) => this.setProfile({ ...this.profile, ...obj });

  updateFields = async (obj, next) => {
    let error;
    await updateDoc(this.dbref, obj)
      .catch(
        (er) => (
          (error = er),
          alert(
            `Couldn't update, make sure you have internet connection and try again.\n\n` +
              (er.message || er.toString())
          )
        )
      )
      .finally(() => {
        next && next();
        !error && runInAction(() => this.localUpdateFields(obj));
      });
  };

  updateBalance = async (balanceRec) =>
    this.updateFields({
      balance: { ...this.profile.balance, [balanceRec.time]: balanceRec },
    });
}

export let handleGoogleAuthUser = ({
  uid,
  email,
  displayName: name,
  photoURL,
  provider,
  providerData: prov,
}) => ({
  uid,
  email,
  name,
  photo: photoURL?.replace("=s96-c", "=s550") || null,
  provider:
    provider ||
    (!prov[0]
      ? null
      : prov[0].providerId.includes("google")
      ? "google"
      : "apple"),
});
