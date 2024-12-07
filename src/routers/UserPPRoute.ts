import express from "express"
import { authentication, createUser, deleteUser, getAllUser, updateUser } from "../controller/userPPConrtoller"
import { verifyAddUser, verifyEditUser } from "../middlewares/verifyUser"
import { verifyAuthentication } from "../middlewares/userValidation"

const app = express()
app.use(express.json())

app.get(`/`, getAllUser)
app.post(`/`, [verifyAddUser], createUser)
app.put(`/:iduser`, [verifyEditUser], updateUser)
app.delete(`/:iduser`, deleteUser)
app.post(`/login`, [verifyAuthentication], authentication)

export default app