import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Carousel } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

/**
 * Slideshow  renders a slideshow of images with a title and description for each image.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {Object[]} props.data - The data for the slideshow. Each object should have a title, description, image, and alt property. The texts should be the keys for the translated strings and for the localised image. They can also specify the time with the time property (in milliseconds).
 * 
 * @returns {JSX.Element} The Slideshow component.
 */
export default function Slideshow({ data }) {
  //Check the parameters
  checkParameters(data);


  //Localisation
  const { t } = useTranslation();


  //Current index of the carousel
  const [currentIndex, setCurrentIndex] = useState(0);


  //Manually change the index
  const handleSelect = (selectedIndex, _) => {
    setCurrentIndex(selectedIndex);
  };


  //Render the component
  return (
    <Row className="mb-5">
      <Col xs={{ span: 12, order: 2 }} md={{ span: 6, order: 1 }} className="d-flex flex-column justify-content-center align-items-center p-3">
        <h3>{t(data[currentIndex].title)}</h3>
        <p>{t(data[currentIndex].description)}</p>
      </Col>
      <Col xs={{ span: 12, order: 1 }} md={{ span: 6, order: 2 }}>
        <Carousel 
          activeIndex={currentIndex} 
          onSelect={handleSelect} 
          prevIcon={<ChevronLeft size={48} />} 
          nextIcon={<ChevronRight size={48} />}
        >
          {data.map((now, index) => (
            <Carousel.Item key={index} interval={now.time || 5000}>
              <img
                className="d-block w-100"
                src={t(data[index].image)}
                alt={t(data[index].alt)}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </Col>
    </Row>
  );
};


/**
 * Checks the parameters passed to the Slideshow component.
 */
function checkParameters(data) {
  if (data === undefined) {
    throw new Error("The data parameter is required.");
  }
  if (!Array.isArray(data)) {
    throw new Error("The data parameter must be an array.");
  }
  if (data.length === 0) {
    throw new Error("The data parameter must not be empty.");
  }

  for (let item of data) {
    if (item.title === undefined) {
      throw new Error("The title property is required in each item.");
    }
    if (item.description === undefined) {
      throw new Error("The description property is required in each item.");
    }
    if (item.image === undefined) {
      throw new Error("The image property is required in each item.");
    }
    if (item.alt === undefined) {
      throw new Error("The alt property is required in each item.");
    }
    if (item.time !== undefined && typeof item.time !== "number") {
      throw new Error("The time property must be a number.");
    }
  }
}
