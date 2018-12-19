class AddingItem {
  constructor(_id) {
    this.id = _id
    this.prompts = ["Enter an item name", "Enter an image url", "Enter an item description"]
    this.values = []
  }

  get next() {
    for (let i = 0; i < this.prompts.length; i++) {
      if (!this.values[i]) return this.prompts[i];
    }
    return "Finished";
  }

  set next(value) {
    for (let i = 0; i < this.prompts.length; i++) {
      if (!this.values[i]) {
        this.values.push(value);
        return
      }
    }
  }
}

module.exports = {
  AddingItem: AddingItem
}
