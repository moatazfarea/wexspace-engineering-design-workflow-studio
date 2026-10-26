import tempfile
import unittest
from pathlib import Path
from vision import fixture,analyze

class VisionDecisionTests(unittest.TestCase):
    def test_valid_scale(self):
        with tempfile.TemporaryDirectory() as d:
            f=Path(d)/"room.png";fixture(f)
            r=analyze(f,{"known_metres":2.0,"pixel_endpoints":[[120,650],[320,650]]})
            self.assertEqual(r["decision"],"CALL_ACTUAL_QUANTITY_TOOL")
            self.assertAlmostEqual(r["length_m"],6,delta=.15)
            self.assertAlmostEqual(r["width_m"],4,delta=.15)
    def test_missing_scale(self):
        with tempfile.TemporaryDirectory() as d:
            f=Path(d)/"room.png";fixture(f)
            self.assertEqual(analyze(f)["decision"],"REQUEST_SCALE")
    def test_bad_input(self):
        self.assertEqual(analyze("/unavailable/image.png")["decision"],"REQUEST_VALID_IMAGE")
    def test_perspective(self):
        with tempfile.TemporaryDirectory() as d:
            f=Path(d)/"room.png";fixture(f,True)
            r=analyze(f,{"known_metres":2.0,"pixel_endpoints":[[120,650],[320,650]]})
            self.assertEqual(r["decision"],"REQUEST_RECTIFICATION")
if __name__=="__main__":unittest.main()
