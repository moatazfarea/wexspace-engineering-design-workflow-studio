import unittest
from agent_bridge import dispatch

BASE={"height":3,"openings":4.68,"coats":2,"coverage":10,"waste":10,"includeCeiling":False,"paintPack":5,"tileSide":0.6,"tilesPerBox":4}

class BridgeTests(unittest.TestCase):
    def test_missing_scale_blocks_provider(self):
        calls=[]
        r=dispatch({"decision":"REQUEST_SCALE","reason":"no_verified_metric_reference"},confirmed=True,assumptions=BASE,calculate=lambda **kw:calls.append(kw))
        self.assertEqual(r["status"],"NEEDS_INPUT")
        self.assertEqual(calls,[])
    def test_confirmation_gate(self):
        calls=[]
        r=dispatch({"decision":"CALL_ACTUAL_QUANTITY_TOOL","length_m":6.04,"width_m":4.04},confirmed=False,assumptions=BASE,calculate=lambda **kw:calls.append(kw))
        self.assertEqual(r["status"],"NEEDS_HUMAN_CONFIRMATION")
        self.assertEqual(calls,[])
    def test_calls_injected_provider_once(self):
        calls=[]
        def calc(**kw):
            calls.append(kw)
            return {"quantities":{"floor_m2":24.4016}}
        r=dispatch({"decision":"CALL_ACTUAL_QUANTITY_TOOL","length_m":6.04,"width_m":4.04},confirmed=True,assumptions=BASE,calculate=calc)
        self.assertEqual(len(calls),1)
        self.assertEqual(r["provider_result"]["quantities"]["floor_m2"],24.4016)
    def test_ceiling_forbidden(self):
        calls=[]
        r=dispatch({"decision":"CALL_ACTUAL_QUANTITY_TOOL","length_m":6,"width_m":4},confirmed=True,assumptions={**BASE,"includeCeiling":True},calculate=lambda **kw:calls.append(kw))
        self.assertEqual(r["reason"],"REQUIREMENT_CONFLICT")
        self.assertEqual(calls,[])
if __name__=="__main__":unittest.main()
