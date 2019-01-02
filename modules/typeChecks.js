module.exports = (bot) => {
  bot.objProps = {
    Cost: {
      name: "item_cost",
      type: "string",
      validFor: ["BasicTrade", "ProceduralTrade", "ClothingTrade", "ColorTrade"]
    },
    Count: {
      name: "item_count",
      type: "number",
      validFor: ["BasicTrade", "ColorTrade"]
    },
    Location: {
      name: "location",
      type: "string",
      validFor: ["BasicTrade", "ProceduralTrade", "ClothingTrade", "ColorTrade"]
    },
    Description: {
      name: "description",
      type: "string",
      validFor: ["Item"]
    },
    "Image Link": {
      name: "image_url",
      type: "image link",
      validFor: ["Item"]
    },
    Category: {
      name: "category",
      type: "choice",
      options: null,
      validFor: ["Item"]
    }
  }
}
