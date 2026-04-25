import { Request, Response } from 'express';

import bcrypt from 'bcrypt';

import prisma from '../config/prisma';

export const registerUser = async (req: Request, res: Response) => {
  // const { username, password, email } = req.body;
  // const saltRounds = 10;

  // const existingUser = await prisma.user.findUnique();

  // bcrypt.genSalt(saltRounds, function (err, salt) {
  //   bcrypt.hash(password, salt, function (err, hash) {
  //     // Store hash in your password DB.
  //   });
  // });

  // res.json({
  //   username,
  //   password,
  // });

  const user = await prisma.user.create({
    data: {
      email: 'ariadne@prisma.io',
      name: 'Ariadne',
      posts: {
        create: [
          {
            title: 'My first day at Prisma',
            categories: { create: { name: 'Office' } },
          },
          {
            title: 'How to connect to a SQLite database',
            categories: {
              create: [{ name: 'Databases' }, { name: 'Tutorials' }],
            },
          },
        ],
      },
    },
  });

  res.json({ message: 'User created' });
};
