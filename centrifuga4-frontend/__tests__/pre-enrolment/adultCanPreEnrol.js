const puppeteer = require('puppeteer');



jest.setTimeout(100000);

describe('Adult', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000/app/prematricula');

  });

  it('can complete pre-enrolment', async () => {
  element = await page.$x(`(.//*[normalize-space(text()) and normalize-space(.)='aquí'])[1]/following::*[name()='svg'][2]`);
	await element[0].click();

	element = await page.$x(`//*[@name="name"]`);
	await element[0].click();

	element = await page.$x(`//*[@name="name"]`);
	await element[0].type(`miquel`);

	element = await page.$x(`//*[@name="surname1"]`);
	await element[0].type(`vázquez`);

	element = await page.$x(`//*[@name="surname2"]`);
	await element[0].type(`rius`);

	element = await page.$x(`//*[@name="birth_date"]`);
	await element[0].type(`0002-01-01`);

	element = await page.$x(`//*[@name="birth_date"]`);
	await element[0].type(`0020-01-01`);

	element = await page.$x(`//*[@name="birth_date"]`);
	await element[0].type(`0200-01-01`);

	element = await page.$x(`//*[@name="birth_date"]`);
	await element[0].type(`2001-01-01`);

	element = await page.$x(`//*[@name="email"]`);
	await element[0].type(`vazquezrius.miquel@gmail.com`);

	element = await page.$x(`//*[@name="address"]`);
	await element[0].type(`bori`);

	element = await page.$x(`//*[@name="city"]`);
	await element[0].type(`barcelona`);

	element = await page.$x(`//*[@name="zip"]`);
	await element[0].click();

	element = await page.$x(`//*[@name="zip"]`);
	await element[0].type(`08017`);

	element = await page.$x(`//*[@name="dni"]`);
	await element[0].click();

	element = await page.$x(`//*[@name="dni"]`);
	await element[0].type(`22933505K`);

	element = await page.$x(`//*[@name="phone"]`);
	await element[0].click();

	element = await page.$x(`//*[@name="phone"]`);
	await element[0].type(`6694253`);

	element = await page.$x(`//*[@id="mui-39140"]`);
	await element[0].click();

	element = await page.$x(`//*[@id="mui-39140-option-0"]`);
	await element[0].click();

	element = await page.$x(`//*[@id="mui-39140"]`);
	await element[0].type(`espanya`);

	element = await page.$x(`//body`);
	await element[0].click();

	element = await page.$x(`//div[@id='menu-gender']/div[3]/ul/li`);
	await element[0].click();

	element = await page.$x(`//body`);
	await element[0].click();

	element = await page.$x(`//div[@id='menu-is_studying']/div[3]/ul/li[2]`);
	await element[0].click();

	element = await page.$x(`//body`);
	await element[0].click();

	element = await page.$x(`//div[@id='menu-is_working']/div[3]/ul/li[2]`);
	await element[0].click();

	element = await page.$x(`//*[@name="years_in_xamfra"]`);
	await element[0].click();

	element = await page.$x(`//*[@name="years_in_xamfra"]`);
	await element[0].type(`10`);

	element = await page.$x(`(.//*[normalize-space(text()) and normalize-space(.)='anys a Xamfrà'])[1]/following::*[name()='svg'][2]`);
	await element[0].click();

	element = await page.$x(`//div[@id='root']/div/div[2]/form/div/div/div/div/button/span`);
	await element[0].click();

	element = await page.$x(`//div[@id='root']/div/div[2]/form/div/div/div/div/button/span`);
	await element[0].click();

	element = await page.$x(`//div[@id='description']/span`);
	await element[0].click();

	element = await page.$x(`(.//*[normalize-space(text()) and normalize-space(.)='course 3'])[1]/following::span[4]`);
	await element[0].click();

	element = await page.$x(`//input[@value='']`);
	await element[0].click();

	element = await page.$x(`//input[@value='']`);
	await element[0].type(`course 2`);

	element = await page.$x(`//div[@id='description']/span`);
	await element[0].click();

	element = await page.$x(`(.//*[normalize-space(text()) and normalize-space(.)='course 29'])[1]/following::*[name()='svg'][2]`);
	await element[0].click();

	element = await page.$x(`//div[@id='root']/div/div[2]/form/div/div/div/ul/div[2]/li/div[2]/span/span/input`);
	await element[0].click();

	element = await page.$x(`//div[@id='root']/div/div[2]/form/div/div/div/ul/div[7]/li/div[2]/span/span/input`);
	await element[0].click();

	element = await page.$x(`(.//*[normalize-space(text()) and normalize-space(.)='Puc fer serveis professionals relacionats amb els meus estudis o professió'])[1]/following::*[name()='svg'][3]`);
	await element[0].click();

	element = await page.$x(`//div[@id='root']/div/div[2]/form/div/div/div/div[2]/label/span[2]`);
	await element[0].click();

	var frames = await page.frames();
	var newFrame = await frames.find(f => f.name() === `index=0`);

	element = await page.$x(`//div[@id='rc-anchor-container']/div[3]/div/div/div`);
	await element[0].click();

	var frames = await page.frames();
	var newFrame = await frames.find(f => f.name() === `relative=parent`);

	element = await page.$x(`(.//*[normalize-space(text()) and normalize-space(.)='comentaris'])[1]/following::*[name()='svg'][3]`);
	await element[0].click();
    await browser.close();

  });

});