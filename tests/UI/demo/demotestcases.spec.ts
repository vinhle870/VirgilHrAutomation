import { test } from '../../../src/fixtures/basetest-fixtures' ;
import fs from 'fs';
import path from 'path';
import { DataFactory } from '../../../src/data-factory/data-factory';


test.describe('Test Login With Valid Creteria and Search Menu Function', () => {

       test('TC01: Successfully Login to System', async ({ loginPage, homePage }) => {

        let userInfo = await DataFactory.getLoginUserInfo();

        console.log('Verify User Login Successfully');

        await loginPage.validateLoginButtonIsHidden();

        await homePage.validateHeadingContainsText('Dashboard');

        if(userInfo)
            await homePage.validateUserNameInfo(userInfo);

    });

    test('TC02: Verify all menues matches with searched contain text are shown', async ({ loginPage, leftmenu }) => {

        const searchText = "A";

        await leftmenu.searchForMenuWithText(searchText);

        await leftmenu.validateDisplayedMenuContainText(searchText)
 });
});