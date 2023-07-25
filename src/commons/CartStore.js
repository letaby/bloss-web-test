import { makeAutoObservable } from "mobx";
import orderBy from "lodash/orderBy";

export default class Cart {
  cart = {};

  constructor(school) {
    makeAutoObservable(this);
    this.school = school;
  }

  get groups() {
    return this.school.groups;
  }

  get coaches() {
    return new Set(Object.keys(this.cart));
  }

  getCart = (coach) => orderBy(Object.values(this.cart[coach] || {}), "from");

  setCoachCart = (coachID, obj) => (this.cart[coachID] = obj);

  add = (obj) => {
    let { privat, coachID } = obj,
      event = privat
        ? Object.assign(obj, { id: String(Date.now()) })
        : { ...this.groups[obj.id], ...obj };
    this.cart[coachID]
      ? (this.cart[coachID][obj.id] = event)
      : (this.cart[coachID] = { [obj.id]: event });
  };

  update = (coachID, id, obj) =>
    (this.cart[coachID][id] = { ...this.cart[coachID][id], ...obj });

  markError = (coachID, id, tx) =>
    (this.cart[coachID][id] = { ...this.cart[coachID][id], error: tx });

  remove = (coachID, id) => delete this.cart[coachID][id];

  clearCart = (coachID) => delete this.cart[coachID];
}
