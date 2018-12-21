class AddingItem {
  constructor(_id, bot) {
    this.id = _id
    this.prompts = ["Enter an item name",
                    "Enter an image url",
                    "Enter an item description",
                    `Choose a category: ${Object.keys(bot.config.categories.value).join(', ')}`]
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

  itemObj() {
    return [
      this.values[0],
      {
        "description": this.values[2],
        "image_url": this.values[1],
        "category": this.values[3]
      }
    ];
  }
}

module.exports = {
  AddingItem: AddingItem
}
