import express from "express";
import { getAllItem, createItem, updateItem, deleteItem } from "../controller/itemController";
import { validateItemInput } from "../middlewares/verifyItem";
import { verifyRole, verifyToken } from "../middlewares/authorization"
import { getItemById } from "../controller/itemController";

const app = express()
app.use(express.json())

app.get(`/`, [verifyToken, verifyRole(["USER","ADMIN"])], getAllItem)
app.post(`/`, [verifyToken, verifyRole(["ADMIN"])],validateItemInput, createItem )
app.put(`/:idItem`, [verifyToken, verifyRole(["ADMIN"])], updateItem)
app.delete(`/:idItem`, [verifyToken, verifyRole(["ADMIN"])], deleteItem)
app.get(`/:idItem`, [verifyToken, verifyRole(["USER","ADMIN"])], getItemById)

export default app