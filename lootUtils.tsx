import { Contract, JsonRpcProvider } from "ethers";
import { getImageForLoot, itemsFromSvg } from "@/utils";


// METAL_ARMOR
//
//     1: ["Holy Chestplate", "Ancient Helm", "Ornate Belt", "Holy Greaves", "Holy Gauntlets"],
//     2: ["Ornate Chestplate", "Ornate Helm", "War Belt", "Ornate Greaves", "Ornate Gauntlets"],
//     3: ["Plate Mail", "Great Helm", "Plated Belt", "Greaves", "Gauntlets"],
//     4: ["Chain Mail", "Full Helm", "Mesh Belt", "Chain Boots", "Chain Gloves"],
//     5: ["Ring Mail", "Helm", "Heavy Belt", "Heavy Boots", "Heavy Gloves"]
//
//
// HIDE_ARMOR
//
//     1: ["Demon Husk", "Demon Crown", "Demonhide Belt", "Demonhide Boots", "Demons Hands"],
//     2: ["Dragonskin Armor", "Dragons Crown", "Dragonskin Belt", "Dragonskin Boots", "Dragonskin Gloves"],
//     3: ["Studded Leather Armor", "War Cap", "Studded Leather Belt", "Studded Leather Boots", "Studded Leather Gloves"],
//     4: ["Hard Leather Armor", "Leather Cap", "Hard Leather Belt", "Hard Leather Boots", "Hard Leather Gloves"],
//     5: ["Leather Armor", "Cap", "Leather Belt", "Leather Boots", "Leather Gloves"]
//
//
// CLOTH_ARMOR
//
//     1: ["Divine Robe", "Crown", "Brightsilk Sash", "Divine Slippers", "Divine Gloves"],
//     2: ["Silk Robe", "Divine Hood", "Silk Hood", "Silk Sash", "Silk Slippers", "Silk Gloves"],
//     3: ["Linen Robe", "Silk Sash", "Wool Sash", "Wool Shoes", "Wool Gloves"],
//     4: ["Robe", "Linen Hood", "Linen Sash", "Linen Shoes", "Linen Gloves"],
//     5: ["Shirt", "Hood", "Sash", "Shoes", "Gloves"]
//
//
// WEAPONS
//
//     1: ["Katana", "Warhammer", "Ghost Wand", "Grimoire"],
//     2: ["Falchion", "Quarterstaff", "Grave Wand", "Chronicle"],
//     3: ["Scimitar", "Maul", "Bone Wand", "Tome"],
//     4: ["Long Sword", "Mace", "Wand", "Book"],
//     5: ["Short Sword", "Club"]

// BronzeRing T3
// SilverRing T2
// GoldRing T1
// PlatinumRing T1
// TitaniumRing T1
// Necklace T1
// Amulet  T1
// Pendant T1

export const Bludgeons = ["Warhammer", "Quarterstaff", "Maul", "Mace", "Club"];
export const Blades = ["Katana", "Falchion", "Scimitar", "Long Sword", "Short Sword"];
export const Wands = ["Ghost Wand", "Grave Wand", "Bone Wand", "Wand"];
export const Books = ["Grimoire", "Chronicle", "Tome", "Book"];

export const MetalArmor = [
    "Holy Chestplate", "Ancient Helm", "Ornate Belt", "Holy Greaves", "Holy Gauntlets",
    "Ornate Chestplate", "Ornate Helm", "War Belt", "Ornate Greaves", "Ornate Gauntlets",
    "Plate Mail", "Great Helm", "Plated Belt", "Greaves", "Gauntlets",
    "Chain Mail", "Full Helm", "Mesh Belt", "Chain Boots", "Chain Gloves",
    "Ring Mail", "Helm", "Heavy Belt", "Heavy Boots", "Heavy Gloves"
];

export const HideArmor = [
    "Demon Husk", "Demon Crown", "Demonhide Belt", "Demonhide Boots", "Demons Hands",
    "Dragonskin Armor", "Dragons Crown", "Dragonskin Belt", "Dragonskin Boots", "Dragonskin Gloves",
    "Studded Leather Armor", "War Cap", "Studded Leather Belt", "Studded Leather Boots", "Studded Leather Gloves",
    "Hard Leather Armor", "Leather Cap", "Hard Leather Belt", "Hard Leather Boots", "Hard Leather Gloves",
    "Leather Armor", "Cap", "Leather Belt", "Leather Boots", "Leather Gloves"
];

export const ClothArmor = [
    "Divine Robe", "Crown", "Brightsilk Sash", "Divine Slippers", "Divine Gloves",
    "Silk Robe", "Divine Hood", "Silk Hood", "Silk Sash", "Silk Slippers", "Silk Gloves",
    "Linen Robe", "Silk Sash", "Wool Sash", "Wool Shoes", "Wool Gloves",
    "Robe", "Linen Hood", "Linen Sash", "Linen Shoes", "Linen Gloves",
    "Shirt", "Hood", "Sash", "Shoes", "Gloves"
];

export const Tier1 = ["Holy Chestplate", "Ancient Helm", "Ornate Belt", "Holy Greaves", "Holy Gauntlets", "Demon Husk", "Demon Crown", "Demonhide Belt", "Demonhide Boots", "Demons Hands", "Divine Robe", "Crown", "Brightsilk Sash", "Divine Slippers", "Divine Gloves", "Katana", "Warhammer", "Ghost Wand", "Grimoire", "Pendant", "Amulet", "Necklace", "Titanium Ring", "Platinum Ring", "Gold Ring"];
export const Tier2 = ["Ornate Chestplate", "Ornate Helm", "War Belt", "Ornate Greaves", "Ornate Gauntlets", "Dragonskin Armor", "Dragons Crown", "Dragonskin Belt", "Dragonskin Boots", "Dragonskin Gloves", "Silk Robe", "Divine Hood", "Silk Hood", "Silk Sash", "Silk Slippers", "Silk Gloves", "Falchion", "Quarterstaff", "Grave Wand", "Chronicle", "Silver Ring"];
export const Tier3 = ["Plate Mail", "Great Helm", "Plated Belt", "Greaves", "Gauntlets", "Studded Leather Armor", "War Cap", "Studded Leather Belt", "Studded Leather Boots", "Studded Leather Gloves", "Linen Robe", "Silk Sash", "Wool Sash", "Wool Shoes", "Wool Gloves", "Scimitar", "Maul", "Bone Wand", "Tome", "Bronze Ring"];
export const Tier4 = ["Chain Mail", "Full Helm", "Mesh Belt", "Chain Boots", "Chain Gloves", "Hard Leather Armor", "Leather Cap", "Hard Leather Belt", "Hard Leather Boots", "Hard Leather Gloves", "Robe", "Linen Hood", "Linen Sash", "Linen Shoes", "Linen Gloves", "Long Sword", "Mace", "Wand", "Book"];
export const Tier5 = ["Ring Mail", "Helm", "Heavy Belt", "Heavy Boots", "Heavy Gloves", "Leather Armor", "Cap", "Leather Belt", "Leather Boots", "Leather Gloves", "Shirt", "Hood", "Sash", "Shoes", "Gloves", "Short Sword", "Club"];

export function getCriticalThreshold(item: string) {
    
    if (getWords(item) === "Titanium Ring") {
        return 0.85;
    }
    return 0.95;
    
}

export function getPowerBoost(item: string) {
    
    if (getWords(item) === "Titanium Ring") {
        return 10;
    }
    return 0;
    
}

function getWeaponType(weapon: string) {
    
    const words = getWords(weapon);
    
    if (Bludgeons.includes(words)) {
        return "Bludgeons";
    }
    if (Blades.includes(words)) {
        return "Blades";
    }
    if (Wands.includes(words)) {
        return "Magic";
    }
    return "Magic";
    
}

function getArmorType(armor: string) {
    
    const words = getWords(armor);
    
    if (HideArmor.includes(words)) {
        return "Hides";
    }
    if (MetalArmor.includes(words)) {
        return "Metal";
    }
    return "Cloth";
    
}

export function getCounterRelation(weapon: string, armor: string) {
    
    const weaponType = getWeaponType(weapon);
    const armorType = getArmorType(armor);
    
    if (weaponType === "Bludgeons") {
        if (armorType === "Hides") {
            return 1.5;
        }
        if (armorType === "Metal") {
            return 0.5;
        }
        return 1;
    }
    if (weaponType === "Blades") {
        if (armorType === "Hides") {
            return 1.5;
        }
        if (armorType === "Metal") {
            return 1;
        }
        return 0.5;
    }
    // if (weaponType === "Magic"){
    if (armorType === "Hides") {
        return 0.5;
    }
    if (armorType === "Metal") {
        return 1.5;
    }
    return 1;
    // }
    
}

export function getTier(item: string) {
    
    const words = getWords(item);
    
    if (Tier1.includes(words)) {
        return 1;
    }
    if (Tier2.includes(words)) {
        return 2;
    }
    if (Tier3.includes(words)) {
        return 3;
    }
    if (Tier4.includes(words)) {
        return 4;
    }
    return 5;
    
}

export function getWords(item: string) {
    
    if (item.startsWith("\"")) {
        item = item.split("\"")[2].slice(1);
    }
    if (item.indexOf("of") >= 0) {
        item = item.split(" of ")[0];
    }
    if (item.endsWith("+1")) {
        item = item.slice(0, -2);
    }
    
    // console.log("item:", item);
    return item;
    
}

export function getLevelColor(item: string) {
    
    const words = getWords(item);
    
    if (Tier1.includes(words)) {
        return "\" class=\"base orange\"> " + item + "</text>";
    }
    if (Tier2.includes(words)) {
        return "\" class=\"base purple\"> " + item + "</text>";
    }
    if (Tier3.includes(words)) {
        return "\" class=\"base blue\"> " + item + "</text>";
    }
    if (Tier4.includes(words)) {
        return "\" class=\"base green\"> " + item + "</text>";
    }
    
    return "\" class=\"base\"> " + item + "</text>";
    
}

export function renderWithColors(items: string[]) {
    
    if (!items) {
        return items;
    }
    
    let result = "<svg xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" viewBox=\"0 0 350 350\"> <style>    .base {        fill: rgb(255, 255, 255);        font-family: serif;        font-size: 14px;    }    .green {        fill: rgb(30, 255, 0);        font-family: serif;        font-size: 14px;    }    .blue {        fill: rgb(0, 112, 221);        font-family: serif;        font-size: 14px;    }    .purple {        fill: rgb(163, 53, 238);        font-family: serif;        font-size: 14px;    }    .orange {        fill: rgb(255, 128, 0);        font-family: serif;        font-size: 14px;    }</style><rect width=\"100%\" height=\"100%\" fill=\"black\" />";
    
    for (let i = 0; i < items.length; i++) {
        result += "<text x=\"10\" y=\"" + (i * 20 + 20).toString(10) + getLevelColor(items[i]);
    }
    
    return result + "</svg>";
    
}

export async function getImageByAddress(address: string) {
    
    const items = await getItemsByAddress(address);
    console.log("items:", items)
    
    // const tokenURIWithColor = renderWithColors(items);
    // console.log("lootWithColor:", tokenURIWithColor);
    // const lootWithColor = "data:image/svg+xml;base64," + Buffer.from(tokenURIWithColor).toString('base64');
    
    return await getImageForLoot(items);
    
}

export async function getItemsByAddress(address: string) {
    
    // todo optional: store the query results
    
    const tokenURIB64 = await new Contract(
        "0x869Ad3Dfb0F9ACB9094BA85228008981BE6DBddE",
        ["function tokenURI(address) public view returns (string)",],
        new JsonRpcProvider("https://rpc.mevblocker.io")).tokenURI(address);
    // console.log("tokenUTIB64", tokenURIB64);
    const tokenURI = JSON.parse(Buffer.from(tokenURIB64.split(",")[1], 'base64').toString("utf8"))
    // console.log("tokenURI:", tokenURI);
    const b64svg = tokenURI.image;
    // console.log("b64svg:", b64svg);
    const svg = Buffer.from(b64svg.split(",")[1], 'base64').toString("utf8")
    // console.log("svg:", svg);
    
    return itemsFromSvg(svg)
    
}
