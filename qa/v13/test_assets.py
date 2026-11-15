"""Negative checks: a pending plan must never pass as reviewed deliverable art."""
import copy, unittest
from assets import validate

class RegistryTests(unittest.TestCase):
    def setUp(self):
        self.item={'id':'game.test','status':'pending','path':None}
    def test_pending_is_allowed_but_has_no_path(self):
        self.assertEqual(validate({'planned':[self.item]}),[])
        self.item['path']='icon-192.png'
        self.assertTrue(validate({'planned':[self.item]}))
    def test_duplicate_semantic_id_is_rejected(self):
        self.assertTrue(validate({'planned':[self.item,copy.copy(self.item)]}))
    def test_missing_raster_is_rejected(self):
        self.item.update(status='approved',path='missing.webp')
        self.assertTrue(validate({'planned':[self.item]}))
    def test_vector_is_not_approved_raster(self):
        self.item.update(status='approved',path='joyi-hello.svg')
        self.assertTrue(validate({'planned':[self.item]}))
    def test_unreviewed_raster_is_rejected(self):
        self.item.update(status='approved',path='icon-192.png',dimensions=[192,192])
        self.assertTrue(validate({'planned':[self.item]}))
    def test_outside_path_is_rejected(self):
        self.item.update(status='approved',path='../outside.png')
        self.assertTrue(validate({'planned':[self.item]}))

if __name__=='__main__':unittest.main()
