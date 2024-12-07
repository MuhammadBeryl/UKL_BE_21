import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { sign } from "jsonwebtoken";
import fs from "fs";
const {v4: uuidv4} = require("uuid");
import md5 from "md5";
import { BASE_URL, SECRET } from "../global";
require("dotenv").config();

const prisma = new PrismaClient();

export const getAllUser = async (request: Request, response: Response) => {
  try {
    const { search } = request.query;
    const allUser = await prisma.user.findMany({
      where: { name: { contains: search?.toString() || "" } },
    });
    return response
      .status(200)
      .json({
        status: true,
        data: allUser,
        message: "User has been retrieved successfully",
      });
  } catch (error) {
    return response
      .status(400)
      .json({
        status: false,
        message: `There was an error: ${error}`,
      });
  }
};

export const createUser = async (request: Request, response: Response) => {
  try {
    const { name, email, password, role } = request.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return response.status(400).json({
        status: false,
        message: "Email is already registered",
      });
    }

    const uuid = uuidv4();

    const newUser = await prisma.user.create({
      data: {
        uuid,
        name,
        email,
        password: md5(password),
        role: role || Role.USER, // Default role USER jika tidak diberikan
      },
    });

    return response.status(200).json({
      status: true,
      data: newUser,
      message: "User successfully created",
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There was an error: ${error}`,
    });
  }
};

export const updateUser = async (request: Request, response: Response) => {
  try {
    const { iduser } = request.params;
    const { name, email, password, role } = request.body;

    const findUser = await prisma.user.findFirst({ where: { id: Number(iduser) } });
    if (!findUser)
      return response
        .status(404)
        .json({ status: false, message: "User not found" });

    const updateUser = await prisma.user.update({
      data: {
        name: name || findUser.name,
        email: email || findUser.email,
        password: password? md5 (password): findUser.password,
        role: role || findUser.role,
      },
      where: { id: Number(iduser) },
    });

    return response
      .status(200)
      .json({
        status: true,
        data: updateUser,
        message: "User successfully updated",
      });
  } catch (error) {
    return response
      .status(400)
      .json({
        status: false,
        message: `There was an error: ${error}`,
      });
  }
};

export const deleteUser = async (request: Request, response: Response) => {
  try {
    const { iduser } = request.params;

    const findUser = await prisma.user.findFirst({ where: { id: Number(iduser) } });
    if (!findUser)
      return response
        .status(404)
        .json({ status: false, message: "User not found" });

    const deleteUser = await prisma.user.delete({
      where: { id: Number(iduser) },
    });

    return response
      .status(200)
      .json({
        status: true,
        data: deleteUser,
        message: "User has been deleted",
      });
  } catch (error) {
    return response
      .status(400)
      .json({
        status: false,
        message: `There was an error: ${error}`,
      });
  }
};

export const authentication = async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body;

    const findUser = await prisma.user.findFirst({
      where: { email, password: md5(password) },
    });

    if (!findUser) {
      return response
        .status(401)
        .json({
          status: false,
          logged: false,
          message: "Invalid email or password",
        });
    }

    const data = {
      id: findUser.id,
      name: findUser.name,
      email: findUser.email,
      role: findUser.role,
    };

    const token = sign(data, SECRET || "your_secret_key", { expiresIn: "1d" });

    return response
      .status(200)
      .json({
        status: true,
        logged: true,
        message: "Login successful",
        token,
      });
  } catch (error) {
    return response
      .status(400)
      .json({
        status: false,
        message: `There was an error: ${error}`,
      });
  }
};
