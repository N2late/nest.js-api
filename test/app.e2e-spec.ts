import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthDto } from 'auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'bookmark/dto';
import * as pactum from 'pactum';
import { domainToUnicode } from 'url';
import { EditUserDto } from 'user/dto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        /* Telling the validation pipe to only validate the data that is passed to the controller, meaning, only the properties that are expected by a given class, for instance */
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    // pactum is a REST API Testing Tool used to automate e2e
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  /* Closing the app after all tests are done. */
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 't@gmail.com',
      password: '123456',
    };
    describe('Singup', () => {
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw if body empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw if body empty', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userToken', 'access_token'); // stores the token in the body of the response
      });
    });
  });

  describe('Users', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userToken}', // $S{userToken} is a pactum variable that stores the token
          })
          .expectStatus(200)
          .inspect();
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Test',
          email: 't2@gmail.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userToken}', // $S{userToken} is a pactum variable that stores the token
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userToken}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First',
        link: 'https://first.com',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userToken}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get all bookmarks of the user', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userToken}',
          })
          .expectStatus(200)
          .expectBodyContains('https://first.com')
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams({
            id: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userToken}',
          })
          .expectStatus(200)
          .expectBodyContains('https://first.com');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://firstever.com',
      };
      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams({
            id: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('https://firstever.com');
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams({
            id: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userToken}',
          })
          .expectStatus(200)
          .expectBodyContains('https://firstever.com');
      });
    });

    it('should throw if bookmark not found', () => {
      return pactum
        .spec()
        .delete('/bookmarks/{id}')
        .withPathParams({
          id: '$S{bookmarkId}',
        })
        .withHeaders({
          Authorization: 'Bearer $S{userToken}',
        })
        .expectStatus(403);
    });
  });
});
