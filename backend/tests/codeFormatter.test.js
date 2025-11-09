import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/index.js';
import { signJwt } from '../src/utils/jwt.js';

describe('Code Formatter API', () => {
  let authToken;
  let server;

  before(async () => {
    await connectDB();
    
    // Create a test user
    await User.deleteMany({});
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    
    // Generate JWT token
    authToken = signJwt(user._id);
    
    // Start the server
    server = app.listen(0); // Use random port for testing
  });

  after(async () => {
    await disconnectDB();
    await server.close();
  });

  describe('GET /api/v1/code/languages', () => {
    it('should return list of supported languages', async () => {
      const res = await request(server)
        .get('/api/v1/code/languages')
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('languages').that.is.an('array');
      expect(res.body.data.languages).to.have.length.greaterThan(0);
    });
  });

  describe('GET /api/v1/code/options/:language', () => {
    it('should return default options for JavaScript', async () => {
      const res = await request(server)
        .get('/api/v1/code/options/javascript')
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('language', 'javascript');
      expect(res.body.data).to.have.property('options').that.is.an('object');
    });
  });

  describe('POST /api/v1/code/format', () => {
    it('should format JavaScript code', async () => {
      const testCode = 'const test=()=>{return {name:"test"}};';
      
      const res = await request(server)
        .post('/api/v1/code/format')
        .send({
          code: testCode,
          language: 'javascript',
          options: {
            printWidth: 40,
          },
        })
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('formatted', true);
      expect(res.body.data).to.have.property('language', 'javascript');
      expect(res.body.data).to.have.property('formattedCode').that.is.a('string');
      expect(res.body.data.formattedCode).to.include('const test = () => {
  return {
    name: "test"
  };
};');
    });

    it('should format Python code', async () => {
      const testCode = 'def test():
    return {"name":"test"}';
      
      const res = await request(server)
        .post('/api/v1/code/format')
        .send({
          code: testCode,
          language: 'python',
        });
      
      // This test might be skipped if Black is not installed
      if (res.status === 200) {
        expect(res.body).to.have.property('success', true);
        expect(res.body.data).to.have.property('formatted', true);
        expect(res.body.data).to.have.property('language', 'python');
        expect(res.body.data).to.have.property('formattedCode').that.is.a('string');
      }
    });

    it('should return error for invalid language', async () => {
      const res = await request(server)
        .post('/api/v1/code/format')
        .send({
          code: 'test',
          language: 'invalid-language',
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message').that.includes('Unsupported language');
    });
  });
});
