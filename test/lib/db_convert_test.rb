require 'test_helper'

class DbConvertTest < ActionController::TestCase
  test 'v20171022190242 to v2018_06_02_192847' do
    v20171022190242_table = {
      'data' => {
        'rows' => [
          { 'id' => 'r903e7801-8858-4ca3-8676-9d176fd59de0' },
          { 'id' => 'r36535024-be2f-40b5-b4d6-2fafbb2357a0' },
          { 'id' => 'rdc8b148e-946c-435f-b88c-0bd82cda2573' },
          { 'id' => 'rf7e6e164-1d07-4d47-84bf-67a30c8cb2f0' },
        ],
        'columns' => [
          { 'id' => 'c339a13d5-8f69-4676-93e6-fc2add252244' },
          { 'id' => 'c6c2823c3-3831-4775-ac18-5c1e4a4c0229' },
          { 'id' => 'ca4bf37f5-4542-4fd1-b898-4e9747dc60f5' },
          { 'id' => 'ce1cca2bc-662d-4813-9c59-a9e244fe4e83' },
        ],
        'cells' => {
          'r903e7801-8858-4ca3-8676-9d176fd59de0,c339a13d5-8f69-4676-93e6-fc2add252244' => {
            'value' => '00',
            'history' => [
              { 'time' => 1530371680103 },
              { 'time' => 1530371680104, 'value' => '00-1' },
            ],
          },
          'r903e7801-8858-4ca3-8676-9d176fd59de0,c6c2823c3-3831-4775-ac18-5c1e4a4c0229' => {
            'value' => '01',
            'history' => [{'time' => 1530371680105 }],
          },
          'r903e7801-8858-4ca3-8676-9d176fd59de0,ca4bf37f5-4542-4fd1-b898-4e9747dc60f5' => {
            'value' => '02',
            'history' => [{ 'time' => 1530371680106 }],
          },
          'r36535024-be2f-40b5-b4d6-2fafbb2357a0,ca4bf37f5-4542-4fd1-b898-4e9747dc60f5' => {
            'value' => '12',
            'history' => [{ 'time' => 1530371680107 }],
          },
        },
      },
    }

    expected_v2018_06_02_192847_state ={
      'settings' => {
        'autoSaveHistory' => true,
        'tableHasHeader' => false,
        'spreadsheetName' => 'Spreadsheet',
      },
      'table' => {
        'major' => {
          'layout' => {
            'ROW' => {
              'defaultSize' => 40,
              'marginSize' => 30,
              'list' => [
                {
                  'id' => '903e7801-8858-4ca3-8676-9d176fd59de0',
                  'size' => 40,
                  'cells' => [
                    {
                      'value' => '00',
                      'history' => [
                        { 'time' => 1530371680103, 'value' => '' },
                        { 'time' => 1530371680104, 'value' => '00-1' },
                      ],
                    },
                    {
                      'value' => '01',
                      'history' => [{ 'time' => 1530371680105, 'value' => '' }],
                    },
                    {
                      'value' => '02',
                      'history' => [{ 'time' => 1530371680106, 'value' => '' }],
                    },
                    {},
                  ],
                },
                {
                  'id' => '36535024-be2f-40b5-b4d6-2fafbb2357a0',
                  'size' => 40,
                  'cells' => [
                    {},
                    {},
                    {
                      'value' => '12',
                      'history' => [{'time' => 1530371680107, 'value' => ''}],
                    },
                    {},
                  ],
                },
                {
                  'id' => 'dc8b148e-946c-435f-b88c-0bd82cda2573',
                  'size' => 40,
                  'cells' => [{}, {}, {}, {}],
                },
                {
                  'id' => 'f7e6e164-1d07-4d47-84bf-67a30c8cb2f0',
                  'size' => 40,
                  'cells' => [{}, {}, {}, {}],
                },
              ],
            },
            'COLUMN' => {
              'defaultSize' => 60,
              'marginSize' => 50,
              'list' => [
                { 'id' => '339a13d5-8f69-4676-93e6-fc2add252244', 'size' => 60 },
                { 'id' => '6c2823c3-3831-4775-ac18-5c1e4a4c0229', 'size' => 60 },
                { 'id' => 'a4bf37f5-4542-4fd1-b898-4e9747dc60f5', 'size' => 60 },
                { 'id' => 'e1cca2bc-662d-4813-9c59-a9e244fe4e83', 'size' => 60 },
              ],
            },
          },
        },
      },
    }

    actual_v2018_06_02_192847_state = DbConvert.v20171022190242_to_v2018_06_02_192847(v20171022190242_table)
    assert_equal(expected_v2018_06_02_192847_state, actual_v2018_06_02_192847_state)
  end
end
