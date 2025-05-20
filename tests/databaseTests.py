# Holden Ernest - 5/19/2025

import unittest
import sys

sys.path.insert(0, '/home/lupu/LupuVault')
from main import database


#!
#!
#* These test cases are NOT run in an active production environment.
#* They are run BEFORE any active production occurs
#!
#!


class TestApp(unittest.TestCase):

    def setUp(self):
        database.createUser('testUser@normal', "dev", "normal")

        database.createList('testUser@normal', 'testList')
        database.createList('testUser@normal', 'testList1')
        database.createList('testUser2@normal', 'testList2')
        database.createList('testUser2@normal', 'testList3')

        database.setGuestPermsForList('testUser2@normal', 'testUser@normal', 'testUser2@normal', 'testList2', 'write')
        database.setGuestPermsForList('testUser2@normal', 'testUser@normal', 'testUser2@normal', 'testList3', 'read')

    def tearDown(self):
        self.assertTrue(database.removeUser('testUser@normal'))

        self.assertTrue(database.removeList('testUser@normal','testUser@normal', 'testList'))
        self.assertTrue(database.removeList('testUser@normal','testUser@normal', 'testList1'))
        self.assertTrue(database.removeList('testUser2@normal','testUser2@normal', 'testList2'))
        self.assertTrue(database.removeList('testUser2@normal','testUser2@normal', 'testList3'))
        
        self.assertTrue(database.removeGuestForList('testUser2@normal', 'testUser@normal', 'testUser2@normal', 'testList2'))
        self.assertTrue(database.removeGuestForList('testUser2@normal', 'testUser@normal', 'testUser2@normal', 'testList3'))

        pass

    ## TESTS:

    def test_getListsInOrder(self):
        self.assertEqual(database.getListsInOrder('testUser@normal'), [('testList', 'testUser@normal'), ('testList1', 'testUser@normal'), ('testList2', 'testUser2@normal'), ('testList3', 'testUser2@normal')])

if __name__ == '__main__':
    unittest.main()