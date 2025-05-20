# Holden Ernest - 5/19/2025

import unittest
from main import app


#!
#!
#* These test cases are NOT run in an active production environment.
#* They are run BEFORE any active production occurs
#!
#!


class TestApp(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def tearDown(self):
        pass

    #def test_home_route(self):
        #response = self.app.get('/')
        #self.assertEqual(response.status_code, 200)
        #self.assertIn(b'Hello, World!', response.data)

if __name__ == '__main__':
    unittest.main()