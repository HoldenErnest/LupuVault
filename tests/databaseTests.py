# Holden Ernest - 5/19/2025

import unittest
import sys

sys.path.insert(0, '/home/lupu/LupuVault')
from main import database

import datetime 


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
        self.assertEqual(database.getFirstList('testUser@normal'), ('testList', 'testUser@normal'))

    def test_UpdateListItem(self):
        self.assertTrue(database.updateListItem('testUser@normal', {"itemID": 1, "owner": "testUser@normal", "listname": "testList", "title": "someTitle", "notes": "", "rating": 6, "tags": "none", "date":"2025-04-15 00:00:00", "imageURL":""}))
        self.assertTrue(database.updateListItem('testUser@normal', {"itemID": 2, "owner": "testUser@normal", "listname": "testList", "title": "someTitle2", "notes": "asd", "rating": 1, "tags": "none2", "date":"2025-04-11 00:00:00", "imageURL":""}))

        newItem = database.getListItemDict('testUser@normal', 'testUser@normal', 'testList', 1)
        newItem["title"] = "newTitle"
        newItem["notes"] = "this is a new notes"
        self.assertTrue(database.updateListItem('testUser@normal', newItem))

        self.assertEqual(database.getListDict('testUser@normal', 'testUser@normal', 'testList'), [{'itemID': 1, 'owner': 'testUser@normal', 'listname': 'testList', 'title': 'newTitle', 'notes': 'this is a new notes', 'rating': 6, "tags": "none", 'date': datetime.datetime(2025, 4, 15, 0, 0), 'imageURL': ''}, {'itemID': 2, 'owner': 'testUser@normal', 'listname': 'testList', 'title': 'someTitle2', 'notes': 'asd', 'rating': 1, "tags": "none2", 'date': datetime.datetime(2025, 4, 11, 0, 0), 'imageURL': ''}])

    

if __name__ == '__main__':
    unittest.main()